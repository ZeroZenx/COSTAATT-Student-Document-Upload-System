<?php

namespace App\Http\Controllers;

use App\Models\Programme;
use App\Models\ProgrammeDocument;
use App\Models\AdmissionsChecklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminProgrammeController extends Controller
{
    /**
     * Display the programme management page
     */
    public function index()
    {
        $programmes = Programme::with('documents')
            ->ordered()
            ->get()
            ->map(function ($programme) {
                return [
                    'id' => $programme->id,
                    'name' => $programme->name,
                    'code' => $programme->code,
                    'description' => $programme->description,
                    'department' => $programme->department,
                    'active' => $programme->active,
                    'sort_order' => $programme->sort_order,
                    'documents_count' => $programme->documents->count(),
                    'required_documents_count' => $programme->documents->where('required', true)->count(),
                    'created_at' => $programme->created_at->format('M d, Y'),
                ];
            });

        // Get available document types
        $availableDocTypes = $this->getAvailableDocumentTypes();

        return Inertia::render('Admin/ProgrammeManagement', [
            'programmes' => $programmes,
            'availableDocTypes' => $availableDocTypes,
        ]);
    }

    /**
     * Store a new programme
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:programmes,name',
            'code' => 'nullable|string|max:50|unique:programmes,code',
            'description' => 'nullable|string',
            'department' => 'required|in:ADMISSIONS,REGISTRY',
            'active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $programme = Programme::create($validated);

        Log::info('Programme created', [
            'programme_id' => $programme->id,
            'name' => $programme->name
        ]);

        return redirect()->back()->with('success', 'Programme created successfully!');
    }

    /**
     * Update an existing programme
     */
    public function update(Request $request, Programme $programme)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:programmes,name,' . $programme->id,
            'code' => 'nullable|string|max:50|unique:programmes,code,' . $programme->id,
            'description' => 'nullable|string',
            'department' => 'required|in:ADMISSIONS,REGISTRY',
            'active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $programme->update($validated);

        Log::info('Programme updated', [
            'programme_id' => $programme->id,
            'name' => $programme->name
        ]);

        return redirect()->back()->with('success', 'Programme updated successfully!');
    }

    /**
     * Delete a programme
     */
    public function destroy(Programme $programme)
    {
        $programmeName = $programme->name;
        $programme->delete();

        Log::info('Programme deleted', [
            'programme_name' => $programmeName
        ]);

        return redirect()->back()->with('success', 'Programme deleted successfully!');
    }

    /**
     * Toggle programme active status
     */
    public function toggleActive(Programme $programme)
    {
        $programme->active = !$programme->active;
        $programme->save();

        Log::info('Programme active status toggled', [
            'programme_id' => $programme->id,
            'active' => $programme->active
        ]);

        return redirect()->back()->with('success', 'Programme status updated!');
    }

    /**
     * Get documents for a specific programme
     */
    public function getDocuments(Programme $programme)
    {
        $documents = $programme->documents()
            ->orderBy('sort_order')
            ->orderBy('doc_type')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'doc_type' => $doc->doc_type,
                    'display_name' => $doc->display_name,
                    'required' => $doc->required,
                    'sort_order' => $doc->sort_order,
                ];
            });

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    /**
     * Add a document requirement to a programme
     */
    public function addDocument(Request $request, Programme $programme)
    {
        $validated = $request->validate([
            'doc_type' => 'required|string',
            'required' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Check if document already exists for this programme
        $exists = ProgrammeDocument::where('programme_id', $programme->id)
            ->where('doc_type', $validated['doc_type'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This document is already added to this programme'
            ], 422);
        }

        $document = $programme->documents()->create($validated);

        Log::info('Document added to programme', [
            'programme_id' => $programme->id,
            'doc_type' => $validated['doc_type']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document requirement added successfully!',
            'document' => [
                'id' => $document->id,
                'doc_type' => $document->doc_type,
                'display_name' => $document->display_name,
                'required' => $document->required,
                'sort_order' => $document->sort_order,
            ]
        ]);
    }

    /**
     * Update a document requirement
     */
    public function updateDocument(Request $request, Programme $programme, ProgrammeDocument $document)
    {
        // Ensure the document belongs to this programme
        if ($document->programme_id !== $programme->id) {
            return response()->json([
                'success' => false,
                'message' => 'Document does not belong to this programme'
            ], 403);
        }

        $validated = $request->validate([
            'required' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $document->update($validated);

        Log::info('Programme document updated', [
            'programme_id' => $programme->id,
            'document_id' => $document->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document requirement updated successfully!'
        ]);
    }

    /**
     * Remove a document requirement from a programme
     */
    public function removeDocument(Programme $programme, ProgrammeDocument $document)
    {
        // Ensure the document belongs to this programme
        if ($document->programme_id !== $programme->id) {
            return response()->json([
                'success' => false,
                'message' => 'Document does not belong to this programme'
            ], 403);
        }

        $docType = $document->doc_type;
        $document->delete();

        Log::info('Document removed from programme', [
            'programme_id' => $programme->id,
            'doc_type' => $docType
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document requirement removed successfully!'
        ]);
    }

    /**
     * Get available document types
     */
    private function getAvailableDocumentTypes()
    {
        return [
            ['value' => 'birth_certificate', 'label' => 'Birth Certificate'],
            ['value' => 'national_id', 'label' => 'National ID Card'],
            ['value' => 'passport', 'label' => 'Passport'],
            ['value' => 'passport_photo', 'label' => 'Passport Biodata page'],
            ['value' => 'academic_transcripts', 'label' => 'Academic Transcripts'],
            ['value' => 'character_reference', 'label' => 'Character Reference'],
            ['value' => 'medical_certificate', 'label' => 'Medical Certificate'],
            ['value' => 'gate_approval', 'label' => 'GATE Approval Letter'],
            ['value' => 'police_certificate', 'label' => 'Police Certificate of Character'],
            ['value' => 'nursing_council_permit', 'label' => 'Nursing Council Permit'],
            ['value' => 'caricom_certificate', 'label' => 'CARICOM Certificate'],
            ['value' => 'study_permit', 'label' => 'Study Permit'],
            ['value' => 'personal_statement', 'label' => 'Personal Statement'],
        ];
    }
}
