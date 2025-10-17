<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submission Complete - COSTAATT</title>
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
            background-color: #059669;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f0fdf4;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .success-box {
            background-color: #dcfce7;
            padding: 20px;
            border-left: 4px solid #16a34a;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box {
            background-color: #e0f2fe;
            padding: 15px;
            border-left: 4px solid #0284c7;
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
        .reference {
            background-color: #fef3c7;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">COSTAATT</div>
        <p>College of Science, Technology and Applied Arts of Trinidad and Tobago</p>
    </div>
    
    <div class="content">
        <h2>🎉 Submission Completed Successfully!</h2>
        
        <p>Dear {{ $student_name ?? 'Student' }},</p>
        
        <div class="success-box">
            <p><strong>Congratulations!</strong></p>
            <p>We are pleased to inform you that your document submission for the programme <strong>{{ $programme }}</strong> has been <strong>completed successfully</strong>.</p>
        </div>
        
        <div class="info-box">
            <p><strong>Submission Details:</strong></p>
            <p><strong>Student ID:</strong> {{ $student_id }}</p>
            <p><strong>Programme:</strong> {{ $programme }}</p>
            @if(isset($reference))
            <div class="reference">
                Reference Number: {{ $reference }}
            </div>
            @endif
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
            <li>The Admissions Department will review your submission</li>
            <li>You will be contacted if additional information is needed</li>
            <li>Keep your reference number for future correspondence</li>
            <li>Check your email regularly for updates</li>
        </ul>
        
        <p><strong>Important Notes:</strong></p>
        <ul>
            <li>Please save this email for your records</li>
            <li>Your reference number should be quoted in all future communications</li>
            <li>Processing time may vary depending on the volume of applications</li>
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