<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Submission Confirmation - COSTAATT</title>
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
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0d7377 0%, #08474a 100%);
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
        .success-icon {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        .reference-number {
            background-color: #f3f4f6;
            border: 2px solid #0d7377;
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
            color: #0d7377;
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
        .next-steps {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .next-steps h3 {
            margin: 0 0 1rem 0;
            color: #1e40af;
        }
        .next-steps ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        .next-steps li {
            margin-bottom: 0.5rem;
            color: #1e40af;
        }
        .contact {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .contact h3 {
            margin: 0 0 1rem 0;
            color: #374151;
        }
        .contact a {
            color: #0d7377;
            text-decoration: none;
        }
        .contact a:hover {
            text-decoration: underline;
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
        .btn {
            display: inline-block;
            background-color: #0d7377;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 1rem 0.5rem;
        }
        .btn:hover {
            background-color: #08474a;
        }
        .btn-secondary {
            background-color: #6b7280;
        }
        .btn-secondary:hover {
            background-color: #4b5563;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Document Submission Confirmation</h1>
            <p>The College of Science, Technology and Applied Arts of Trinidad and Tobago</p>
        </div>

        <div class="content">
            <div class="success-icon">
                <span style="font-size: 3rem;">✅</span>
            </div>

            <h2 style="text-align: center; color: #059669; margin-bottom: 1rem;">
                Your {{ $submission->department_display }} Documents Have Been Successfully Submitted!
            </h2>

            <p style="text-align: center; color: #6b7280; margin-bottom: 2rem;">
                Thank you for using the COSTAATT Student Document Upload System. Your documents are now being processed.
            </p>

            <div class="reference-number">
                <h2>Your Reference Number</h2>
                <p class="reference-code">{{ $submission->reference }}</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
                    Please save this reference number for your records
                </p>
            </div>

            <div class="details">
                <h3>Submission Details</h3>
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
                    <span class="detail-label">Programme:</span>
                    <span class="detail-value">{{ $submission->programme }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Campus:</span>
                    <span class="detail-value">{{ $submission->campus }}</span>
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
                    <span class="detail-label">Submission Date:</span>
                    <span class="detail-value">{{ $submission->created_at->format('F j, Y \a\t g:i A') }}</span>
                </div>
            </div>

            <div class="details">
                <h3>Uploaded Documents ({{ $submission->documents->count() }})</h3>
                @foreach($submission->documents as $document)
                <div class="detail-row">
                    <span class="detail-label">{{ $document->doc_type_display }}:</span>
                    <span class="detail-value">{{ $document->formatted_size }}</span>
                </div>
                @endforeach
            </div>

            <div class="next-steps">
                <h3>What Happens Next?</h3>
                <ul>
                    <li>The {{ $submission->department_display }} team will review your documents</li>
                    <li>You will be contacted if additional information is required</li>
                    <li>Processing typically takes {{ $submission->dept === 'ADMISSIONS' ? '5-7' : '2-3' }} business days</li>
                    @if($submission->dept === 'REGISTRY')
                    <li>You will receive your course schedule and student ID card</li>
                    @endif
                </ul>
            </div>

            <div class="contact">
                <h3>Contact Information</h3>
                <p><strong>{{ $submission->department_display }} Department:</strong></p>
                <p>Email: <a href="mailto:{{ $submission->dept === 'ADMISSIONS' ? 'admissions@costaatt.edu.tt' : 'registry@costaatt.edu.tt' }}">
                    {{ $submission->dept === 'ADMISSIONS' ? 'admissions@costaatt.edu.tt' : 'registry@costaatt.edu.tt' }}
                </a></p>
                <p>Phone: (868) 625-5030 ext. {{ $submission->dept === 'ADMISSIONS' ? '8601' : '102' }}</p>
                <p>Hours: Monday - Friday, 8:00 AM - 4:00 PM</p>
            </div>

            <div style="text-align: center;">
                <a href="{{ url('/') }}" class="btn">Return to Home</a>
                <a href="{{ url('/student-docs/' . strtolower($submission->dept) . '/confirmation/' . $submission->id) }}" class="btn btn-secondary">View Online</a>
            </div>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} COSTAATT. All rights reserved.</p>
            <p>For technical support, contact the IT Department.</p>
        </div>
    </div>
</body>
</html>
