<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Upload Confirmation - COSTAATT</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #1e40af;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f8fafc;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .highlight {
            background-color: #dbeafe;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">COSTAATT</div>
        <p>College of Science, Technology and Applied Arts of Trinidad and Tobago</p>
    </div>
    
    <div class="content">
        <h2>Document Upload Confirmation</h2>
        
        <p>Dear {{ $student_name ?? 'Student' }},</p>
        
        <div class="highlight">
            <p><strong>✅ Document Successfully Uploaded!</strong></p>
            <p>Your document <strong>{{ ucwords(str_replace('_', ' ', $doc_type)) }}</strong> has been successfully uploaded for the programme <strong>{{ $programme }}</strong>.</p>
            <p><strong>Student ID:</strong> {{ $student_id }}</p>
        </div>
        
        <p>You may continue uploading your remaining required documents. Once all required documents are uploaded, you can finalize your submission.</p>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Continue uploading any remaining required documents</li>
            <li>Review your submission checklist</li>
            <li>Click "Submit All Documents" when complete</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact the Technology Services Department.</p>
    </div>
    
    <div class="footer">
        <p><strong>Technology Services Department</strong><br>
        College of Science, Technology and Applied Arts of Trinidad and Tobago (COSTAATT)</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>