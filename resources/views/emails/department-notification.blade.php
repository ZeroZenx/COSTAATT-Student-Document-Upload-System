<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Document Submission - {{ $submission->department_display }} - COSTAATT</title>
    <style>
        body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 2rem;
        }
        .alert-icon {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        .reference-number {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
            margin: 1.5rem 0;
        }
        .reference-number h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
            color: #374151;
        }
        .reference-code {
            font-family: 'Courier New', monospace;
            font-size: 1.5rem;
            font-weight: bold;
            color: #dc2626;
            margin: 0;
        }
        .details {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .details h3 {
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            color: #374151;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 500;
            color: #6b7280;
        }
        .detail-value {
            color: #374151;
        }
        .documents-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        .documents-table th,
        .documents-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .documents-table th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
        }
        .status-submitted {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .urgent {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .urgent h3 {
            margin: 0 0 1rem 0;
            color: #dc2626;
        }
        .urgent ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        .urgent li {
            margin-bottom: 0.5rem;
            color: #dc2626;
        }
        .action-required {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .action-required h3 {
            margin: 0 0 1rem 0;
            color: #92400e;
        }
        .btn {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 1rem 0.5rem;
        }
        .btn:hover {
            background-color: #991b1b;
        }
        .btn-secondary {
            background-color: #6b7280;
        }
        .btn-secondary:hover {
            background-color: #4b5563;
        }
        .footer {
            background-color: #f9fafb;
            padding: 1.5rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            font-size: 0.875rem;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Document Submission - {{ $submission->department_display }}</h1>
            <p>The College of Science, Technology and Applied Arts of Trinidad and Tobago</p>
        </div>

        <div class="content">
            <div class="alert-icon">
                <span style="font-size: 3rem;">🔔</span>
            </div>

            <h2 style="text-align: center; color: #dc2626; margin-bottom: 1rem;">
                New {{ $submission->department_display }} Document Submission Requires Review
            </h2>

            <p style="text-align: center; color: #6b7280; margin-bottom: 2rem;">
                A student has submitted documents through the COSTAATT Student Document Upload System.
            </p>

            <div class="reference-number">
                <h2>Reference Number</h2>
                <p class="reference-code">{{ $submission->reference }}</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
                    Submitted on {{ $submission->created_at->format('F j, Y \a\t g:i A') }}
                </p>
            </div>

            <div class="details">
                <h3>Student Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Student Name:</span>
                    <span class="detail-value">{{ $submission->full_name }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Student ID:</span>
                    <span class="detail-value">{{ $submission->student_id }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ $submission->email }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date of Birth:</span>
                    <span class="detail-value">{{ $submission->dob->format('F j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Programme:</span>
                    <span class="detail-value">{{ $submission->programme }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Campus:</span>
                    <span class="detail-value">{{ $submission->campus }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Intake Term:</span>
                    <span class="detail-value">{{ $submission->intake_term }}</span>
                </div>
                @if($submission->academic_year)
                <div class="detail-row">
                    <span class="detail-label">Academic Year:</span>
                    <span class="detail-value">{{ $submission->academic_year }}</span>
                </div>
                @endif
                @if($submission->semester)
                <div class="detail-row">
                    <span class="detail-label">Semester:</span>
                    <span class="detail-value">{{ $submission->semester }}</span>
                </div>
                @endif
                <div class="detail-row">
                    <span class="detail-label">Funding Type:</span>
                    <span class="detail-value">{{ $submission->funding_type_display }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="status-badge status-submitted">{{ $submission->status_display }}</span>
                    </span>
                </div>
            </div>

            <div class="details">
                <h3>Uploaded Documents ({{ $submission->documents->count() }})</h3>
                <table class="documents-table">
                    <thead>
                        <tr>
                            <th>Document Type</th>
                            <th>Original Filename</th>
                            <th>File Size</th>
                            <th>Upload Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($submission->documents as $document)
                        <tr>
                            <td>{{ $document->doc_type_display }}</td>
                            <td>{{ $document->original_name }}</td>
                            <td>{{ $document->formatted_size }}</td>
                            <td>{{ $document->created_at->format('M j, Y g:i A') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="action-required">
                <h3>Action Required</h3>
                <ul>
                    <li>Review all uploaded documents for completeness and accuracy</li>
                    <li>Verify student information matches submitted documents</li>
                    <li>Check that all required documents are present</li>
                    <li>Update submission status in the system</li>
                    @if($submission->dept === 'ADMISSIONS')
                    <li>Process admission decision and notify student</li>
                    @else
                    <li>Process registration and prepare course materials</li>
                    @endif
                </ul>
            </div>

            @if($submission->documents->count() < 5)
            <div class="urgent">
                <h3>⚠️ Attention Required</h3>
                <ul>
                    <li>This submission has fewer documents than typically expected</li>
                    <li>Please verify if additional documents are required</li>
                    <li>Contact the student if clarification is needed</li>
                </ul>
            </div>
            @endif

            <div style="text-align: center;">
                <a href="{{ url('/admin/submissions/' . $submission->id) }}" class="btn">Review Submission</a>
                <a href="{{ url('/admin/submissions') }}" class="btn btn-secondary">View All Submissions</a>
            </div>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} COSTAATT. All rights reserved.</p>
            <p>This is an automated notification from the Student Document Upload System.</p>
        </div>
    </div>
</body>
</html>
