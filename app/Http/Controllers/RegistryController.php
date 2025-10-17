<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\AdmissionsChecklist;
use App\Services\GraphMailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RegistryController extends Controller
{
    protected ?GraphMailService $mailService = null;

    public function __construct()
    {
        // Don't instantiate GraphMailService in constructor to avoid errors when not needed
    }

    protected function getMailService(): ?GraphMailService
    {
        if ($this->mailService === null) {
            try {
                $this->mailService = app(GraphMailService::class);
            } catch (\Exception $e) {
                \Log::warning('GraphMailService not available: ' . $e->getMessage());
                return null;
            }
        }
        return $this->mailService;
    }

    public function start()
    {
        return Inertia::render('Registry/Start');
    }

    public function storeStudentInfo(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:255',
            'semester' => 'required|string|max:255',
            'funding_status' => 'required|string|max:255',
            'insurance_form' => 'nullable|file|mimes:pdf|max:10240',
            'gate_application' => 'nullable|file|mimes:pdf|max:10240',
            'payment_terms_form' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        Log::info('Registry form submission received', [
            'student_id' => $validated['student_id'],
            'email' => $validated['email'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'academic_year' => $validated['academic_year'],
            'semester' => $validated['semester'],
            'funding_status' => $validated['funding_status']
        ]);

        // Check if submission already exists
        $existingSubmission = Submission::where('student_id', $validated['student_id'])
            ->where('dept', Submission::DEPT_REGISTRY)
            ->first();

        if ($existingSubmission) {
            return redirect()->route('registry.confirmation', $existingSubmission);
        }

        try {
            $submission = Submission::create([
                ...$validated,
                'dept' => Submission::DEPT_REGISTRY,
                'status' => Submission::STATUS_SUBMITTED, // Registry goes directly to submitted
                'programme' => 'Registry Registration', // Default programme for registry submissions
                'intake_term' => $validated['academic_year'], // Use academic_year as intake_term
                'campus' => 'Not Specified', // Default campus
                'nationality' => 'Not Specified', // Default nationality
                'funding_type' => $validated['funding_status'], // Use funding status from form
            ]);

            // Generate reference number for Registry submissions
            $submission->reference = $submission->generateReference();
            $submission->save();

            // Process uploaded files
            $this->processUploadedFiles($request, $submission);

            Log::info('Registry submission created successfully', [
                'submission_id' => $submission->id,
                'student_id' => $submission->student_id,
                'reference' => $submission->reference
            ]);

            // Send completion email using Graph API
            try {
                $mailService = app(\App\Services\GraphMailService::class);
                $success = $mailService->sendSubmissionConfirmation($submission);
                
                if ($success) {
                    Log::info('Registry completion email sent successfully via Graph API', [
                        'submission_id' => $submission->id,
                        'student_id' => $submission->student_id,
                        'reference' => $submission->reference
                    ]);
                } else {
                    Log::warning('Failed to send Registry completion email via Graph API', [
                        'submission_id' => $submission->id,
                        'student_id' => $submission->student_id,
                        'reference' => $submission->reference
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Registry completion email failed: ' . $e->getMessage());
            }

            return redirect()->route('registry.confirmation', $submission);
        } catch (\Exception $e) {
            Log::error('Registry submission creation failed', [
                'error' => $e->getMessage(),
                'student_id' => $validated['student_id'],
                'validated_data' => $validated
            ]);
            
            return back()->withErrors(['error' => 'Failed to create submission: ' . $e->getMessage()]);
        }
    }

    public function confirmation(Submission $submission)
    {
        if ($submission->dept !== Submission::DEPT_REGISTRY) {
            abort(404);
        }

        // Load the documents relationship and add display attributes (in case there are any documents)
        $submission->load('documents');
        
        // Add display attributes to documents if any exist
        $submission->documents->each(function($document) {
            $document->doc_type_display = $document->getDocTypeDisplayAttribute();
            $document->formatted_size = $document->getFormattedSizeAttribute();
        });

        Log::info('Registry confirmation page accessed', [
            'submission_id' => $submission->id,
            'student_id' => $submission->student_id,
            'documents_count' => $submission->documents->count()
        ]);

        return Inertia::render('Registry/Confirmation', [
            'submission' => $submission,
        ]);
    }

    public function getChecklist()
    {
        // Return empty checklist since Registry doesn't use document uploads
        return response()->json([]);
    }

    protected function processUploadedFiles(Request $request, Submission $submission)
    {
        Log::info('Processing uploaded files for Registry submission', [
            'submission_id' => $submission->id,
            'has_files' => $request->hasFile('insurance_form') || $request->hasFile('gate_application') || $request->hasFile('payment_terms_form'),
            'all_files' => $request->allFiles()
        ]);

        $documentTypes = [
            'insurance_form' => 'insurance_form',
            'gate_application' => 'gate_application', 
            'payment_terms_form' => 'payment_terms_form',
        ];

        foreach ($documentTypes as $fileKey => $docType) {
            if ($request->hasFile($fileKey)) {
                Log::info("Processing file upload for: {$fileKey}");
                $file = $request->file($fileKey);
                
                // Generate unique filename
                $timestamp = now()->format('Y-m-d_H-i-s');
                $uuid = \Illuminate\Support\Str::uuid();
                $filename = "{$docType}_{$timestamp}_{$uuid}.pdf";

                // Get file content
                $fileContent = file_get_contents($file->getRealPath());

                // Try to upload to OneDrive using GraphStorageService, fallback to local storage
                try {
                    $graphStorage = new \App\Services\GraphStorageService();
                    $oneDriveResult = $graphStorage->uploadToOneDrive(
                        $submission->dept,
                        $submission->student_id,
                        $filename,
                        $fileContent
                    );
                } catch (\Exception $e) {
                    Log::warning('GraphStorageService failed, using local storage: ' . $e->getMessage());
                    // Fallback to local storage
                    $year = now()->year;
                    $directory = "{$submission->dept}/{$year}/{$submission->student_id}";
                    $storedPath = $file->storeAs($directory, $filename, 'onedrive_local');
                    $oneDriveResult = [
                        'id' => 'local_' . uniqid(),
                        'name' => $filename,
                        'path' => $storedPath,
                        'fallback' => true
                    ];
                }

                // Create document record with appropriate path
                $filePath = isset($oneDriveResult['fallback']) && $oneDriveResult['fallback'] 
                    ? $oneDriveResult['path']
                    : "OneDrive/{$submission->dept}/{$submission->student_id}/{$filename}";
                    
                $submission->documents()->create([
                    'doc_type' => $docType,
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                Log::info('Registry document uploaded successfully', [
                    'submission_id' => $submission->id,
                    'doc_type' => $docType,
                    'filename' => $filename,
                    'one_drive_id' => $oneDriveResult['id'] ?? 'unknown'
                ]);
            }
        }
    }
}