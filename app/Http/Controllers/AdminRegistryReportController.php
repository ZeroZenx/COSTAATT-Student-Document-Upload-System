<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminRegistryReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Submission::withCount('documents')
            ->with(['documents'])
            ->where('dept', Submission::DEPT_REGISTRY);

        // Filters
        if ($request->filled('programme')) {
            $query->where('programme', $request->programme);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('nationality')) {
            $query->where('nationality', $request->nationality);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('student_id', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $submissions = $query->orderBy('created_at', 'desc')->paginate(25);

        // Calculate summary statistics
        $totalStudents = Submission::where('dept', Submission::DEPT_REGISTRY)->count();
        
        $totalDocs = DB::table('documents')
            ->join('submissions', 'submissions.id', '=', 'documents.submission_id')
            ->where('submissions.dept', Submission::DEPT_REGISTRY)
            ->count();
            
        $avgDocs = $totalStudents > 0 ? round($totalDocs / $totalStudents, 2) : 0;
        
        $verified = Submission::where('dept', Submission::DEPT_REGISTRY)
            ->where('status', Submission::STATUS_COMPLETED)
            ->count();
            
        $submitted = Submission::where('dept', Submission::DEPT_REGISTRY)
            ->where('status', Submission::STATUS_SUBMITTED)
            ->count();

        $summary = [
            'totalStudents' => $totalStudents,
            'totalDocs' => $totalDocs,
            'avgDocs' => $avgDocs,
            'verified' => $verified,
            'submitted' => $submitted,
        ];

        // Get filter options
        $programmes = Submission::where('dept', Submission::DEPT_REGISTRY)
            ->distinct()
            ->pluck('programme')
            ->filter()
            ->sort()
            ->values();
            
        $nationalities = Submission::where('dept', Submission::DEPT_REGISTRY)
            ->distinct()
            ->pluck('nationality')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('Admin/RegistryReport', [
            'submissions' => $submissions,
            'summary' => $summary,
            'filters' => [
                'programmes' => $programmes,
                'nationalities' => $nationalities,
                'statuses' => [
                    Submission::STATUS_IN_PROGRESS,
                    Submission::STATUS_SUBMITTED,
                    Submission::STATUS_COMPLETED,
                ],
            ],
            'currentFilters' => $request->only(['programme', 'status', 'nationality', 'search']),
        ]);
    }

    public function export(Request $request)
    {
        $query = Submission::withCount('documents')
            ->with(['documents'])
            ->where('dept', Submission::DEPT_REGISTRY);

        // Apply same filters as index
        if ($request->filled('programme')) {
            $query->where('programme', $request->programme);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('nationality')) {
            $query->where('nationality', $request->nationality);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('student_id', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $submissions = $query->orderBy('created_at', 'desc')->get();

        $filename = 'registry_report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($submissions) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Student ID',
                'Full Name',
                'Email',
                'Programme',
                'Academic Year',
                'Semester',
                'Documents Uploaded',
                'Status',
                'Reference Number',
                'Submission Date',
                'Last Updated'
            ]);

            // CSV Data
            foreach ($submissions as $submission) {
                fputcsv($file, [
                    $submission->student_id,
                    $submission->first_name . ' ' . $submission->last_name,
                    $submission->email,
                    $submission->programme,
                    $submission->academic_year,
                    $submission->semester,
                    $submission->documents_count,
                    $submission->status,
                    $submission->reference,
                    $submission->created_at->format('Y-m-d H:i:s'),
                    $submission->updated_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
