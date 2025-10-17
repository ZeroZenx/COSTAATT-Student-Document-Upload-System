<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminAdmissionsController extends Controller
{
    public function index(Request $request)
    {
        $query = Submission::with(['documents'])
            ->where('dept', 'ADMISSIONS')
            ->withCount('documents');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('student_id', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('programme', 'like', "%{$search}%");
            });
        }

        // Filter by intake term
        if ($request->has('intake_term') && $request->intake_term) {
            $query->where('intake_term', $request->intake_term);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by funding type
        if ($request->has('funding_type') && $request->funding_type) {
            $query->where('funding_type', $request->funding_type);
        }

        // Filter by campus
        if ($request->has('campus') && $request->campus) {
            $query->where('campus', $request->campus);
        }

        // Date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $submissions = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get filter options
        $intakeTerms = Submission::where('dept', 'ADMISSIONS')
            ->distinct()
            ->pluck('intake_term')
            ->sort()
            ->values();

        $campuses = Submission::where('dept', 'ADMISSIONS')
            ->distinct()
            ->pluck('campus')
            ->sort()
            ->values();

        $programmes = Submission::where('dept', 'ADMISSIONS')
            ->distinct()
            ->pluck('programme')
            ->sort()
            ->values();

        return Inertia::render('Admin/AdmissionsDashboard', [
            'submissions' => $submissions,
            'filters' => [
                'intakeTerms' => $intakeTerms,
                'campuses' => $campuses,
                'programmes' => $programmes,
                'statuses' => [
                    'IN_PROGRESS' => 'In Progress',
                    'SUBMITTED' => 'Submitted',
                    'PROCESSING' => 'Processing',
                    'COMPLETED' => 'Completed',
                ],
                'fundingTypes' => [
                    'GATE' => 'GATE',
                    'SELF' => 'Self-Funded',
                ],
            ],
            'currentFilters' => $request->only(['search', 'intake_term', 'status', 'funding_type', 'campus', 'date_from', 'date_to']),
        ]);
    }

    public function show($id)
    {
        $submission = Submission::with(['documents'])
            ->where('dept', 'ADMISSIONS')
            ->findOrFail($id);

        return Inertia::render('Admin/SubmissionDetail', [
            'submission' => $submission,
            'department' => 'admissions',
        ]);
    }

    public function download($documentId)
    {
        $document = Document::findOrFail($documentId);
        
        // Verify the document belongs to an admissions submission
        if ($document->submission->dept !== 'ADMISSIONS') {
            abort(403, 'Unauthorized access to document');
        }

        // Check if file exists
        if (!Storage::disk('onedrive_local')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('onedrive_local')->download(
            $document->file_path,
            $document->original_name
        );
    }

    public function exportCsv(Request $request)
    {
        $query = Submission::where('dept', 'ADMISSIONS');

        // Apply same filters as index method
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('student_id', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('programme', 'like', "%{$search}%");
            });
        }

        if ($request->has('intake_term') && $request->intake_term) {
            $query->where('intake_term', $request->intake_term);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('funding_type') && $request->funding_type) {
            $query->where('funding_type', $request->funding_type);
        }

        if ($request->has('campus') && $request->campus) {
            $query->where('campus', $request->campus);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $submissions = $query->withCount('documents')
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'ADMISSIONS_submissions_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($submissions) {
            $handle = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($handle, [
                'Student ID',
                'First Name',
                'Last Name',
                'Email',
                'Date of Birth',
                'Programme',
                'Intake Term',
                'Campus',
                'Nationality',
                'Funding Type',
                'Has Disability',
                'Status',
                'Reference Number',
                'Documents Count',
                'Submission Date',
                'Last Updated',
            ]);

            // CSV Data
            foreach ($submissions as $submission) {
                fputcsv($handle, [
                    $submission->student_id,
                    $submission->first_name,
                    $submission->last_name,
                    $submission->email,
                    $submission->dob ? $submission->dob->format('Y-m-d') : '',
                    $submission->programme,
                    $submission->intake_term,
                    $submission->campus,
                    $submission->nationality ?? '',
                    $submission->funding_type,
                    $submission->has_disability === null ? 'Not specified' : ($submission->has_disability ? 'Yes' : 'No'),
                    $submission->status,
                    $submission->reference,
                    $submission->documents_count,
                    $submission->created_at->format('Y-m-d H:i:s'),
                    $submission->updated_at->format('Y-m-d H:i:s'),
                ]);
            }
            
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function updateStatus($id, Request $request)
    {
        try {
            $submission = Submission::where('dept', 'ADMISSIONS')->findOrFail($id);

            $request->validate([
                'status' => 'required|in:IN_PROGRESS,SUBMITTED,PROCESSING,COMPLETED',
            ]);

            \Log::info('Updating status for admissions submission', [
                'submission_id' => $id,
                'current_status' => $submission->status,
                'new_status' => $request->status
            ]);

            $submission->update([
                'status' => $request->status,
            ]);

            \Log::info('Admissions status updated successfully', [
                'submission_id' => $id,
                'new_status' => $submission->fresh()->status
            ]);

            return redirect()->back()->with('success', 'Status updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error updating admissions status', [
                'submission_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            
            return redirect()->back()->with('error', 'Failed to update status: ' . $e->getMessage());
        }
    }
}
