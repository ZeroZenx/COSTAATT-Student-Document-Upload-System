<?php

use App\Http\Controllers\AdminAdmissionsController;
use App\Http\Controllers\AdminAdmissionsReportController;
use App\Http\Controllers\AdminRegistryController;
use App\Http\Controllers\AdminRegistryManagementController;
use App\Http\Controllers\AdminRegistryReportController;
use App\Http\Controllers\AdminTermController;
use App\Http\Controllers\AdmissionsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RegistryController;
use App\Services\GraphStorageService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/test', function () {
    return Inertia::render('Test');
});
Route::get('/simple-test', function () {
    return Inertia::render('SimpleTest');
});

// Microsoft Graph API verification route
Route::get('/verify-graph', function () {
    try {
        $graph = new GraphStorageService();
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
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'account' => config('services.microsoft.sender_upn'),
        ], 500);
    }
});

// API-like web routes for checklist
Route::get('/api-checklist/{dept}/{programme}/{intakeTerm}/{campus}/{fundingType}/{nationality?}', function ($dept, $programme, $intakeTerm, $campus, $fundingType, $nationality = null) {
    // Decode URL-encoded parameters
    $programme = urldecode($programme);
    $intakeTerm = urldecode($intakeTerm);
    $campus = urldecode($campus);
    $nationality = $nationality ? urldecode($nationality) : null;
    
    \Log::info('Checklist API called with params:', [
        'dept' => $dept,
        'programme' => $programme,
        'intakeTerm' => $intakeTerm,
        'campus' => $campus,
        'fundingType' => $fundingType,
        'nationality' => $nationality
    ]);
    
    $result = \App\Models\AdmissionsChecklist::getAllDocuments($programme, $intakeTerm, $campus, $fundingType, $dept, $nationality);
    
    \Log::info('Checklist API result:', [
        'count' => count($result),
        'documents' => $result
    ]);
    
    return $result;
});

// Registry checklist route
Route::get('/api-registry-checklist', function () {
    return \App\Models\AdmissionsChecklist::where('dept', 'REGISTRY')
        ->select('doc_type', 'required')
        ->distinct()
        ->get()
        ->map(function ($item) {
            return [
                'doc_type' => $item->doc_type,
                'display_name' => ucwords(str_replace('_', ' ', $item->doc_type)),
                'required' => $item->required
            ];
        });
});

// Chatbot API routes
Route::get('/api/chatbot/search', function (Request $request) {
    $studentId = $request->get('student_id');
    $reference = $request->get('reference');
    
    if (!$studentId && !$reference) {
        return response()->json(['error' => 'Student ID or Reference Number required'], 400);
    }
    
    $query = \App\Models\Submission::withCount('documents');
    
    if ($studentId) {
        $query->where('student_id', $studentId);
    } elseif ($reference) {
        $query->where('reference', $reference);
    }
    
    $submission = $query->first();
    
    if (!$submission) {
        return response()->json(['submission' => null]);
    }
    
    return response()->json(['submission' => $submission]);
});
Route::get('/admin', [HomeController::class, 'admin'])->name('admin');

// Admissions routes
Route::prefix('student-docs/admissions')->name('admissions.')->group(function () {
    Route::get('/start', [AdmissionsController::class, 'start'])->name('start');
    Route::post('/start', [AdmissionsController::class, 'storeStudentInfo'])->name('store');
    Route::get('/checklist/{submission}', [AdmissionsController::class, 'checklist'])->name('checklist');
    Route::post('/document/{submission}/{docType}/upload', [AdmissionsController::class, 'uploadDocument'])->name('upload');
    Route::get('/document/{submission}/{document}', [AdmissionsController::class, 'downloadDocument'])->name('download-document');
    Route::post('/submit/{submission}', [AdmissionsController::class, 'submit'])->name('submit');
    Route::get('/confirmation/{submission}', [AdmissionsController::class, 'confirmation'])->name('confirmation');
});

// Registry routes
Route::prefix('student-docs/registry')->name('registry.')->group(function () {
    Route::get('/start', [RegistryController::class, 'start'])->name('start');
    Route::post('/start', [RegistryController::class, 'storeStudentInfo'])->name('store');
    Route::get('/confirmation/{submission}', [RegistryController::class, 'confirmation'])->name('confirmation');
});

// Admin Admissions Routes
Route::prefix('/admin/admissions')->name('admin.admissions.')->group(function () {
    Route::get('/', [AdminAdmissionsController::class, 'index'])->name('index');
    Route::get('/view/{id}', [AdminAdmissionsController::class, 'show'])->name('show');
    Route::get('/download/{documentId}', [AdminAdmissionsController::class, 'download'])->name('download');
    Route::get('/export', [AdminAdmissionsController::class, 'exportCsv'])->name('export');
    Route::post('/update-status/{id}', [AdminAdmissionsController::class, 'updateStatus'])->name('update-status');
    Route::delete('/delete/{id}', [AdminAdmissionsController::class, 'destroy'])->name('destroy');
});

// Admin Registry Routes
Route::prefix('/admin/registry')->name('admin.registry.')->group(function () {
    Route::get('/', [AdminRegistryController::class, 'index'])->name('index');
    Route::get('/view/{id}', [AdminRegistryController::class, 'show'])->name('show');
    Route::get('/download/{documentId}', [AdminRegistryController::class, 'download'])->name('download');
    Route::get('/export', [AdminRegistryController::class, 'exportCsv'])->name('export');
    Route::post('/update-status/{id}', [AdminRegistryController::class, 'updateStatus'])->name('update-status');
    Route::delete('/delete/{id}', [AdminRegistryController::class, 'destroy'])->name('destroy');
});

// Admin Term Management Routes
Route::prefix('/admin/terms')->name('admin.terms.')->group(function () {
    Route::get('/', [AdminTermController::class, 'index'])->name('index');
    Route::post('/', [AdminTermController::class, 'store'])->name('store');
    Route::put('/{term}', [AdminTermController::class, 'update'])->name('update');
    Route::delete('/{term}', [AdminTermController::class, 'destroy'])->name('destroy');
    Route::post('/{term}/toggle-active', [AdminTermController::class, 'toggleActive'])->name('toggle-active');
    Route::post('/{term}/set-current', [AdminTermController::class, 'setCurrent'])->name('set-current');
    Route::post('/sort-order', [AdminTermController::class, 'updateSortOrder'])->name('sort-order');
});

// Admin Registry Management Routes
Route::prefix('/admin/registry')->name('admin.registry.')->group(function () {
    // Academic Years
    Route::get('/academic-years', [AdminRegistryManagementController::class, 'academicYears'])->name('academic-years');
    Route::post('/academic-years', [AdminRegistryManagementController::class, 'storeAcademicYear'])->name('academic-years.store');
    Route::put('/academic-years/{academicYear}', [AdminRegistryManagementController::class, 'updateAcademicYear'])->name('academic-years.update');
    Route::delete('/academic-years/{academicYear}', [AdminRegistryManagementController::class, 'destroyAcademicYear'])->name('academic-years.destroy');
    Route::post('/academic-years/{academicYear}/toggle-active', [AdminRegistryManagementController::class, 'toggleAcademicYearActive'])->name('academic-years.toggle-active');
    Route::post('/academic-years/{academicYear}/set-current', [AdminRegistryManagementController::class, 'setAcademicYearCurrent'])->name('academic-years.set-current');
    
    // Semesters
    Route::get('/semesters', [AdminRegistryManagementController::class, 'semesters'])->name('semesters');
    Route::post('/semesters', [AdminRegistryManagementController::class, 'storeSemester'])->name('semesters.store');
    Route::put('/semesters/{semester}', [AdminRegistryManagementController::class, 'updateSemester'])->name('semesters.update');
    Route::delete('/semesters/{semester}', [AdminRegistryManagementController::class, 'destroySemester'])->name('semesters.destroy');
    Route::post('/semesters/{semester}/toggle-active', [AdminRegistryManagementController::class, 'toggleSemesterActive'])->name('semesters.toggle-active');
    Route::post('/semesters/{semester}/set-current', [AdminRegistryManagementController::class, 'setSemesterCurrent'])->name('semesters.set-current');
});

// Admin Reporting Routes
Route::prefix('/admin')->name('admin.')->group(function () {
    // Admissions Report
    Route::get('/admissions/report', [AdminAdmissionsReportController::class, 'index'])->name('admissions.report');
    Route::get('/admissions/report/export', [AdminAdmissionsReportController::class, 'export'])->name('admissions.report.export');
    
    // Registry Report
    Route::get('/registry/report', [AdminRegistryReportController::class, 'index'])->name('registry.report');
    Route::get('/registry/report/export', [AdminRegistryReportController::class, 'export'])->name('registry.report.export');
});
