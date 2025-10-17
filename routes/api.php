<?php

use App\Http\Controllers\AdminAdmissionsController;
use App\Http\Controllers\AdminRegistryController;
use App\Http\Controllers\AdmissionsController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\RegistryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return ['message' => 'API is working'];
});

// API routes for admissions
Route::get('/programmes', [AdmissionsController::class, 'getProgrammes']);
Route::get('/post-compass-programmes', [AdmissionsController::class, 'getPostCompassProgrammes']);
Route::get('/intake-terms', [AdmissionsController::class, 'getIntakeTerms']);
Route::get('/campuses', [AdmissionsController::class, 'getCampuses']);
Route::get('/checklist/{dept}/{programme}/{intakeTerm}/{campus}/{fundingType}/{nationality?}', [AdmissionsController::class, 'getChecklist']);
Route::get('/registry/checklist', [RegistryController::class, 'getChecklist']);

// API routes for term management
Route::get('/terms', [\App\Http\Controllers\AdminTermController::class, 'getTermsForApi']);

// API routes for academic years and semesters
Route::get('/academic-years', [\App\Http\Controllers\AdminRegistryManagementController::class, 'getAcademicYearsForApi']);
Route::get('/semesters', [\App\Http\Controllers\AdminRegistryManagementController::class, 'getSemestersForApi']);

// Admissions document upload and finalization (legacy API endpoints)
Route::post('/admissions/upload', [AdmissionsController::class, 'uploadDocument']);
Route::post('/admissions/finalize', [AdmissionsController::class, 'finalizeSubmission']);

// Registry routes (no document upload needed)

// Microsoft Graph API verification
Route::get('/verify-graph', function () {
    try {
        $graph = new \App\Services\GraphStorageService();
        $result = $graph->verifyConnection();
        
        if (isset($result['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to connect to Microsoft Graph: ' . $result['error'],
                'account' => config('services.microsoft.sender_upn'),
            ], 500);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Connected to Microsoft Graph successfully.',
            'account' => config('services.microsoft.sender_upn'),
            'drive_info' => $result,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'account' => config('services.microsoft.sender_upn'),
        ], 500);
    }
});

// Admin API routes
Route::get('/admin/admissions', [AdminAdmissionsController::class, 'index']);
Route::get('/admin/registry', [AdminRegistryController::class, 'index']);

// Chatbot API routes
Route::post('/chatbot/student', [ChatbotController::class, 'studentChat']);
