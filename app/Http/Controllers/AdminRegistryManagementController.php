<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AdminRegistryManagementController extends Controller
{
    /**
     * Display academic years management page.
     */
    public function academicYears()
    {
        $academicYears = AcademicYear::orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/RegistryManagement', [
            'type' => 'academic-years',
            'title' => 'Academic Year Management',
            'data' => $academicYears,
        ]);
    }

    /**
     * Display semesters management page.
     */
    public function semesters()
    {
        $semesters = Semester::orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/RegistryManagement', [
            'type' => 'semesters',
            'title' => 'Semester Management',
            'data' => $semesters,
        ]);
    }

    /**
     * Store a newly created academic year.
     */
    public function storeAcademicYear(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        AcademicYear::create($validated);

        return redirect()->route('admin.registry.academic-years')
            ->with('success', 'Academic year created successfully.');
    }

    /**
     * Store a newly created semester.
     */
    public function storeSemester(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:semesters,name',
            'short_name' => 'nullable|string|max:10',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($validated['is_current'] ?? false) {
            Semester::where('is_current', true)->update(['is_current' => false]);
        }

        Semester::create($validated);

        return redirect()->route('admin.registry.semesters')
            ->with('success', 'Semester created successfully.');
    }

    /**
     * Update the specified academic year.
     */
    public function updateAcademicYear(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('academic_years', 'name')->ignore($academicYear->id)],
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validated['name'] !== $academicYear->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('id', '!=', $academicYear->id)->update(['is_current' => false]);
        }

        $academicYear->update($validated);

        return redirect()->route('admin.registry.academic-years')
            ->with('success', 'Academic year updated successfully.');
    }

    /**
     * Update the specified semester.
     */
    public function updateSemester(Request $request, Semester $semester)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('semesters', 'name')->ignore($semester->id)],
            'short_name' => 'nullable|string|max:10',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validated['name'] !== $semester->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($validated['is_current'] ?? false) {
            Semester::where('id', '!=', $semester->id)->update(['is_current' => false]);
        }

        $semester->update($validated);

        return redirect()->route('admin.registry.semesters')
            ->with('success', 'Semester updated successfully.');
    }

    /**
     * Remove the specified academic year.
     */
    public function destroyAcademicYear(AcademicYear $academicYear)
    {
        $submissionCount = $academicYear->submissions()->count();
        
        if ($submissionCount > 0) {
            return redirect()->route('admin.registry.academic-years')
                ->with('error', "Cannot delete academic year '{$academicYear->name}' because it has {$submissionCount} submission(s). Please deactivate it instead.");
        }

        $academicYear->delete();

        return redirect()->route('admin.registry.academic-years')
            ->with('success', 'Academic year deleted successfully.');
    }

    /**
     * Remove the specified semester.
     */
    public function destroySemester(Semester $semester)
    {
        $submissionCount = $semester->submissions()->count();
        
        if ($submissionCount > 0) {
            return redirect()->route('admin.registry.semesters')
                ->with('error', "Cannot delete semester '{$semester->name}' because it has {$submissionCount} submission(s). Please deactivate it instead.");
        }

        $semester->delete();

        return redirect()->route('admin.registry.semesters')
            ->with('success', 'Semester deleted successfully.');
    }

    /**
     * Toggle academic year active status.
     */
    public function toggleAcademicYearActive(AcademicYear $academicYear)
    {
        $academicYear->update(['is_active' => !$academicYear->is_active]);

        $status = $academicYear->is_active ? 'activated' : 'deactivated';
        return redirect()->route('admin.registry.academic-years')
            ->with('success', "Academic year '{$academicYear->name}' has been {$status}.");
    }

    /**
     * Toggle semester active status.
     */
    public function toggleSemesterActive(Semester $semester)
    {
        $semester->update(['is_active' => !$semester->is_active]);

        $status = $semester->is_active ? 'activated' : 'deactivated';
        return redirect()->route('admin.registry.semesters')
            ->with('success', "Semester '{$semester->name}' has been {$status}.");
    }

    /**
     * Set academic year as current.
     */
    public function setAcademicYearCurrent(AcademicYear $academicYear)
    {
        AcademicYear::where('id', '!=', $academicYear->id)->update(['is_current' => false]);
        $academicYear->update(['is_current' => true]);

        return redirect()->route('admin.registry.academic-years')
            ->with('success', "Academic year '{$academicYear->name}' has been set as current.");
    }

    /**
     * Set semester as current.
     */
    public function setSemesterCurrent(Semester $semester)
    {
        Semester::where('id', '!=', $semester->id)->update(['is_current' => false]);
        $semester->update(['is_current' => true]);

        return redirect()->route('admin.registry.semesters')
            ->with('success', "Semester '{$semester->name}' has been set as current.");
    }

    /**
     * Get academic years for API.
     */
    public function getAcademicYearsForApi()
    {
        return AcademicYear::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'is_current', 'start_date', 'end_date']);
    }

    /**
     * Get semesters for API.
     */
    public function getSemestersForApi()
    {
        return Semester::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'short_name', 'is_current', 'start_date', 'end_date']);
    }
}
