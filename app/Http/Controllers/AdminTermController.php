<?php

namespace App\Http\Controllers;

use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AdminTermController extends Controller
{
    /**
     * Display a listing of terms.
     */
    public function index()
    {
        $terms = Term::orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/TermManagement', [
            'terms' => $terms,
        ]);
    }

    /**
     * Store a newly created term.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:terms,name',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Ensure only one term can be current
        if ($validated['is_current'] ?? false) {
            Term::where('is_current', true)->update(['is_current' => false]);
        }

        $term = Term::create($validated);

        return redirect()->route('admin.terms.index')
            ->with('success', 'Term created successfully.');
    }

    /**
     * Update the specified term.
     */
    public function update(Request $request, Term $term)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('terms', 'name')->ignore($term->id)],
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $term->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Ensure only one term can be current
        if ($validated['is_current'] ?? false) {
            Term::where('id', '!=', $term->id)->update(['is_current' => false]);
        }

        $term->update($validated);

        return redirect()->route('admin.terms.index')
            ->with('success', 'Term updated successfully.');
    }

    /**
     * Remove the specified term.
     */
    public function destroy(Term $term)
    {
        // Check if term has submissions
        $submissionCount = $term->submissions()->count();
        
        if ($submissionCount > 0) {
            return redirect()->route('admin.terms.index')
                ->with('error', "Cannot delete term '{$term->name}' because it has {$submissionCount} submission(s). Please deactivate it instead.");
        }

        $term->delete();

        return redirect()->route('admin.terms.index')
            ->with('success', 'Term deleted successfully.');
    }

    /**
     * Toggle term active status.
     */
    public function toggleActive(Term $term)
    {
        $term->update(['is_active' => !$term->is_active]);

        $status = $term->is_active ? 'activated' : 'deactivated';
        return redirect()->route('admin.terms.index')
            ->with('success', "Term '{$term->name}' has been {$status}.");
    }

    /**
     * Set term as current.
     */
    public function setCurrent(Term $term)
    {
        // First, set all other terms as not current
        Term::where('id', '!=', $term->id)->update(['is_current' => false]);
        
        // Then set this term as current
        $term->update(['is_current' => true]);

        return redirect()->route('admin.terms.index')
            ->with('success', "Term '{$term->name}' has been set as current term.");
    }

    /**
     * Get terms for API (for use in forms).
     */
    public function getTermsForApi()
    {
        return Term::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'is_current', 'start_date', 'end_date']);
    }

    /**
     * Bulk update sort order.
     */
    public function updateSortOrder(Request $request)
    {
        $validated = $request->validate([
            'terms' => 'required|array',
            'terms.*.id' => 'required|exists:terms,id',
            'terms.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['terms'] as $termData) {
            Term::where('id', $termData['id'])
                ->update(['sort_order' => $termData['sort_order']]);
        }

        return response()->json(['success' => true]);
    }
}
