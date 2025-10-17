<?php

namespace App\Http\Controllers;

use App\Models\AdmissionsChecklist;
use App\Models\Submission;
use App\Models\Document;
use App\Services\GraphMailService;
use App\Services\GraphStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdmissionsController extends Controller
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
        return Inertia::render('Admissions/Start');
    }

    public function storeStudentInfo(Request $request)
    {
        \Log::info('Admissions form submission received', $request->all());
        
        $validated = $request->validate([
            'student_id' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'dob' => 'required|date|before:today',
            'programme' => 'required|string|max:255',
            'intake_term' => 'required|string|max:255',
            'campus' => 'required|string|max:255',
            'nationality' => 'required|string|max:255',
            'funding_type' => 'required|in:GATE,SELF',
        ]);

        \Log::info('Admissions form validation passed', $validated);

        // Check if submission already exists (only if student_id is provided)
        $existingSubmission = null;
        if (!empty($validated['student_id'])) {
            $existingSubmission = Submission::where('student_id', $validated['student_id'])
                ->where('dept', Submission::DEPT_ADMISSIONS)
                ->first();
        }

        if ($existingSubmission) {
            return redirect()->route('admissions.checklist', $existingSubmission);
        }

        $submission = Submission::create([
            ...$validated,
            'dept' => Submission::DEPT_ADMISSIONS,
            'status' => Submission::STATUS_IN_PROGRESS,
        ]);

        return redirect()->route('admissions.checklist', $submission);
    }

    public function checklist(Submission $submission)
    {
        if ($submission->dept !== Submission::DEPT_ADMISSIONS) {
            abort(404);
        }

        $submission->load('documents');

        return Inertia::render('Admissions/Checklist', [
            'submission' => $submission,
        ]);
    }


    public function submit(Submission $submission)
    {
        if ($submission->dept !== Submission::DEPT_ADMISSIONS) {
            abort(404);
        }

        // Get required documents for this submission
        $requiredDocuments = AdmissionsChecklist::getRequiredDocuments(
            $submission->programme,
            $submission->intake_term,
            $submission->campus,
            $submission->funding_type,
            'ADMISSIONS',
            $submission->nationality
        );

        // Check if all required documents are uploaded
        $uploadedDocuments = $submission->documents->pluck('doc_type')->toArray();
        $missingDocuments = array_diff($requiredDocuments, $uploadedDocuments);

        if (!empty($missingDocuments)) {
            return back()->withErrors([
                'submission' => 'Please upload all required documents before submitting.',
                'missing_documents' => $missingDocuments,
            ]);
        }

        // Generate reference number
        if (!$submission->reference) {
            $submission->reference = $submission->generateReference();
        }

        // Update status
        $submission->update([
            'status' => Submission::STATUS_SUBMITTED,
        ]);

        // Send confirmation email
        try {
            // Send completion confirmation email
            Mail::send('emails.submission_complete', [
                'student_id' => $submission->student_id,
                'programme' => $submission->programme,
                'student_name' => $submission->first_name . ' ' . $submission->last_name,
                'reference' => $submission->reference,
            ], function ($message) use ($submission) {
                $message->to($submission->email)
                        ->subject('COSTAATT Admissions: Submission Completed Successfully');
            });

            // Also try to use GraphMailService if available
            $mailService = $this->getMailService();
            if ($mailService) {
                $mailService->sendSubmissionConfirmation($submission);
                $mailService->sendDepartmentNotification($submission);
            }
        } catch (\Exception $e) {
            \Log::error('Email sending failed: ' . $e->getMessage());
        }

        return redirect()->route('admissions.confirmation', $submission);
    }

    public function confirmation(Submission $submission)
    {
        if ($submission->dept !== Submission::DEPT_ADMISSIONS) {
            abort(404);
        }

        // Load the documents relationship and add display attributes
        $submission->load('documents');
        
        // Add display attributes to documents
        $submission->documents->each(function($document) {
            $document->doc_type_display = $document->getDocTypeDisplayAttribute();
            $document->formatted_size = $document->getFormattedSizeAttribute();
        });

        Log::info('Confirmation page accessed', [
            'submission_id' => $submission->id,
            'student_id' => $submission->student_id,
            'documents_count' => $submission->documents->count()
        ]);

        return inertia('Admissions/Confirmation', [
            'submission' => $submission,
        ]);
    }

    // API endpoints
    public function getProgrammes()
    {
        return [
            'Early Childhood Care and Education (BA)',
            'Medical Laboratory Technology (AAS, BSc)',
            'Medical Ultrasound (AdvDip)',
            'Radiography (BSc)',
            'Environmental Health (AAS, BSc)',
            'Occupational Safety and Health (AAS, BSc)',
            'Social Work (BSW)',
            'General Nursing (AAS, BSc)',
            'Psychiatric Nursing (AAS, BSc)',
        ];
    }

    public function getIntakeTerms()
    {
        // Get active terms from database, fallback to hardcoded if none exist
        $terms = \App\Models\Term::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        // Fallback to hardcoded terms if database is empty
        if (empty($terms)) {
            return [
                'September 2024',
                'January 2025',
                'May 2025',
                'September 2025',
            ];
        }

        return $terms;
    }

    public function getPostCompassProgrammes()
    {
        return [
            'AAS General Nursing',
            'AAS Psychiatric Nursing',
            'AAS Medical Laboratory Technology',
            'AAS Occupational Safety and Health',
            'AAS Environmental Health',
            'AS Biology',
            'AAS Business Administration',
            'AS Management Studies for the Protective Services',
            'AAS Information Technology',
            'AAS Library and Information Studies',
            'AA Literatures in English',
            'AA Film and Video Production',
            'AA Performing Arts: Music',
            'AAS Graphic Design (on hold, advertising BA)',
            'AAS Advertising and Promotions',
            'AA Journalism',
            'AAS Journalism and Public Relations',
            'AA Spanish',
            'AAS Spanish for Business',
            'AAS in Criminal Justice',
            'AA Psychology',
            'AAS Social Work',
            'AS Mathematics',
            'AAS CAT Reporting',
            'AAS in IT – Webpage Development',
            'BSc General Nursing',
            'BSc Psychiatric Nursing',
            'BSc Medical Laboratory Technology',
            'BSc Radiography',
            'BSc Occupational Safety and Health',
            'BSc Environmental Health',
            'BA Accounting',
            'BBA Management and Entrepreneurship',
            'BBA Human Resource Management',
            'BBA Marketing',
            'BSc Information Technology',
            'BSc Networking',
            'BSc Library and Information Science',
            'BA Mass Communication',
            'BA Graphic Design',
            'BA Criminal Justice',
            'BSc Psychology',
            'BSW Social Work',
            'BA in Early Childhood Care and Education',
            'BASC in IT – Webpage Development'
        ];
    }

    public function getCampuses()
    {
        return [
            'Port of Spain Campus',
            'San Fernando Campus',
            'Tobago Campus',
            'Chaguanas Campus',
        ];
    }

    public function getChecklist(string $dept, string $programme, string $intakeTerm, string $campus, string $fundingType, string $nationality = null)
    {
        \Log::info('API getChecklist called with params:', [
            'dept' => $dept,
            'programme' => $programme,
            'intakeTerm' => $intakeTerm,
            'campus' => $campus,
            'fundingType' => $fundingType,
            'nationality' => $nationality
        ]);
        
        try {
            $result = AdmissionsChecklist::getAllDocuments($programme, $intakeTerm, $campus, $fundingType, $dept, $nationality);
            \Log::info('API getChecklist result:', ['count' => count($result)]);
            return $result;
        } catch (\Exception $e) {
            \Log::error('API getChecklist error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload a document for a submission to OneDrive with email notification
     */
    public function uploadDocument(Request $request, Submission $submission, string $docType)
    {
        if ($submission->dept !== Submission::DEPT_ADMISSIONS) {
            abort(404);
        }

        $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240', // 10MB max
        ]);

        $file = $request->file('document');
        
        // Validate MIME type
        if ($file->getMimeType() !== 'application/pdf') {
            return back()->withErrors(['document' => 'Only PDF files are allowed.']);
        }

        try {
            // Generate unique filename
            $timestamp = now()->format('Y-m-d_H-i-s');
            $uuid = Str::uuid();
            $filename = "{$docType}_{$timestamp}_{$uuid}.pdf";

            // Get file content
            $fileContent = file_get_contents($file->getRealPath());

            // Try to upload to OneDrive using GraphStorageService, fallback to local storage
            try {
                $graphStorage = new GraphStorageService();
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

            // Delete existing document of same type
            $existingDocument = $submission->documents()->where('doc_type', $docType)->first();
            if ($existingDocument) {
                // Note: We don't delete from OneDrive here as it's more complex
                // In production, you might want to implement a cleanup mechanism
                $existingDocument->delete();
            }

            // Create document record with appropriate path
            $filePath = isset($oneDriveResult['fallback']) && $oneDriveResult['fallback'] 
                ? $oneDriveResult['path']
                : "OneDrive/{$submission->dept}/{$submission->student_id}/{$filename}";
                
            $document = $submission->documents()->create([
                'doc_type' => $docType,
                'original_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            // Send upload confirmation email using Graph API
            try {
                $mailService = app(\App\Services\GraphMailService::class);
                $success = $mailService->sendUploadConfirmation(
                    $submission->email,
                    $submission->student_id,
                    $submission->programme,
                    $docType,
                    $submission->first_name . ' ' . $submission->last_name
                );
                
                if ($success) {
                    Log::info('Upload confirmation email sent successfully via Graph API', [
                        'student_id' => $submission->student_id,
                        'doc_type' => $docType
                    ]);
                } else {
                    Log::warning('Failed to send upload confirmation email via Graph API', [
                        'student_id' => $submission->student_id,
                        'doc_type' => $docType
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Upload confirmation email failed: ' . $e->getMessage());
            }

            Log::info('Document uploaded to OneDrive successfully', [
                'submission_id' => $submission->id,
                'doc_type' => $docType,
                'filename' => $filename,
                'one_drive_id' => $oneDriveResult['id'] ?? 'unknown'
            ]);

            $storageMessage = isset($oneDriveResult['fallback']) && $oneDriveResult['fallback'] 
                ? 'Document uploaded to local storage successfully. Confirmation email sent.'
                : 'Document uploaded to OneDrive successfully. Confirmation email sent.';
                
            return back()->with('success', $storageMessage);
        } catch (\Exception $e) {
            Log::error('OneDrive upload failed', [
                'submission_id' => $submission->id,
                'doc_type' => $docType,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['document' => 'Upload failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Finalize submission and send completion email (API endpoint)
     */
    public function finalizeSubmission(Request $request)
    {
        try {
            Log::info('Finalize submission request received', [
                'student_id' => $request->student_id,
                'request_data' => $request->all()
            ]);

            $request->validate(['student_id' => 'required|string']);

            $submission = Submission::where('student_id', $request->student_id)
                ->where('dept', 'ADMISSIONS')
                ->firstOrFail();

            Log::info('Submission found', [
                'submission_id' => $submission->id,
                'status' => $submission->status
            ]);
        } catch (\Exception $e) {
            Log::error('Error in finalizeSubmission: ' . $e->getMessage(), [
                'student_id' => $request->student_id ?? 'unknown',
                'error' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error processing request: ' . $e->getMessage()
            ], 500);
        }

        try {
            // Check if all required documents are uploaded
            $requiredDocuments = AdmissionsChecklist::getRequiredDocuments(
                $submission->programme,
                $submission->intake_term,
                $submission->campus,
                $submission->funding_type,
                'ADMISSIONS',
                $submission->nationality
            );

            $uploadedDocuments = $submission->documents->pluck('doc_type')->toArray();
            $missingDocuments = array_diff($requiredDocuments, $uploadedDocuments);

            if (!empty($missingDocuments)) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Please upload all required documents before finalizing.',
                    'missing_documents' => $missingDocuments
                ], 400);
            }

            // Generate reference number if not exists
            if (!$submission->reference) {
                $submission->reference = $submission->generateReference();
            }

            $submission->status = 'SUBMITTED';
            $submission->save();

            Log::info('Submission status updated to SUBMITTED', [
                'submission_id' => $submission->id,
                'reference' => $submission->reference
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating submission status: ' . $e->getMessage(), [
                'submission_id' => $submission->id ?? 'unknown'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error updating submission: ' . $e->getMessage()
            ], 500);
        }

        // Send completion email using Graph API
        try {
            $mailService = app(\App\Services\GraphMailService::class);
            $success = $mailService->sendSubmissionConfirmation($submission);
            
            if ($success) {
                Log::info('Submission completion email sent successfully via Graph API', [
                    'submission_id' => $submission->id,
                    'student_id' => $submission->student_id,
                    'reference' => $submission->reference
                ]);
            } else {
                Log::warning('Failed to send completion email via Graph API', [
                    'submission_id' => $submission->id,
                    'student_id' => $submission->student_id,
                    'reference' => $submission->reference
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Submission completion email failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true, 
            'message' => 'Submission finalized and email sent.',
            'reference' => $submission->reference
        ]);
    }

    /**
     * Download/view a document for a submission
     */
    public function downloadDocument(Submission $submission, Document $document)
    {
        // Verify the document belongs to this submission
        if ($document->submission_id !== $submission->id || $submission->dept !== Submission::DEPT_ADMISSIONS) {
            abort(403, 'Unauthorized access to document');
        }

        // Check if file exists in local storage
        if (Storage::disk('onedrive_local')->exists($document->file_path)) {
            return Storage::disk('onedrive_local')->response(
                $document->file_path,
                $document->original_name,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="' . $document->original_name . '"'
                ]
            );
        }

        abort(404, 'File not found');
    }

    /**
     * Send upload failure notification email (API endpoint)
     */
    public function sendUploadFailureNotification(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|string',
                'email' => 'required|email',
                'programme' => 'required|string',
                'doc_type' => 'required|string',
                'student_name' => 'required|string',
                'error_message' => 'required|string',
                'attempts' => 'required|integer|min:1|max:3'
            ]);

            $mailService = app(\App\Services\GraphMailService::class);
            $success = $mailService->sendUploadFailureNotification(
                $validated['email'],
                $validated['student_id'],
                $validated['programme'],
                $validated['doc_type'],
                $validated['student_name'],
                $validated['error_message'],
                $validated['attempts']
            );

            if ($success) {
                Log::info('Upload failure notification sent successfully', [
                    'student_id' => $validated['student_id'],
                    'doc_type' => $validated['doc_type'],
                    'attempts' => $validated['attempts']
                ]);
                return response()->json(['success' => true, 'message' => 'Notification sent successfully']);
            } else {
                Log::warning('Failed to send upload failure notification', [
                    'student_id' => $validated['student_id'],
                    'doc_type' => $validated['doc_type'],
                    'attempts' => $validated['attempts']
                ]);
                return response()->json(['success' => false, 'message' => 'Failed to send notification'], 500);
            }

        } catch (\Exception $e) {
            Log::error('Upload failure notification error: ' . $e->getMessage(), [
                'request_data' => $request->all()
            ]);
            return response()->json(['success' => false, 'message' => 'Internal server error'], 500);
        }
    }
}
