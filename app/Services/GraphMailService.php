<?php

namespace App\Services;

use App\Models\Submission;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class GraphMailService
{
    protected ?string $accessToken = null;

    public function __construct()
    {
        try {
            $this->accessToken = $this->getAccessToken();
            if (!$this->accessToken) {
                Log::warning('Microsoft Graph not initialized - no access token');
            }
        } catch (\Exception $e) {
            Log::error('Failed to initialize Microsoft Graph: ' . $e->getMessage());
            $this->accessToken = null;
        }
    }

    protected function getAccessToken(): string
    {
        $tenantId = config('services.microsoft.tenant_id');
        $clientId = config('services.microsoft.client_id');
        $clientSecret = config('services.microsoft.client_secret');

        if (!$tenantId || !$clientId || !$clientSecret) {
            Log::warning('Microsoft Graph credentials not configured');
            return '';
        }

        try {
            $response = Http::withOptions(['verify' => false])->asForm()->post(
                'https://login.microsoftonline.com/' . $tenantId . '/oauth2/v2.0/token',
                [
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'scope' => 'https://graph.microsoft.com/.default',
                    'grant_type' => 'client_credentials',
                ]
            );

            if ($response->successful()) {
                $tokenData = $response->json();
                return $tokenData['access_token'] ?? '';
            } else {
                Log::error('Failed to get access token: ' . $response->body());
                return '';
            }
        } catch (\Exception $e) {
            Log::error('Exception getting access token: ' . $e->getMessage());
            return '';
        }
    }

    public function sendSubmissionConfirmation(Submission $submission): bool
    {
        if (!$this->accessToken) {
            Log::warning('Cannot send email - Microsoft Graph not initialized');
            return false;
        }

        try {
            $subject = "Document Submission Confirmation - {$submission->reference}";
            $body = view('emails.submission-complete', [
                'student_id' => $submission->student_id,
                'programme' => $submission->programme,
                'student_name' => $submission->first_name . ' ' . $submission->last_name,
                'reference' => $submission->reference,
            ])->render();

            $message = [
                'message' => [
                    'subject' => $subject,
                    'body' => [
                        'contentType' => 'HTML',
                        'content' => $body,
                    ],
                    'toRecipients' => [
                        [
                            'emailAddress' => [
                                'address' => $submission->email,
                            ],
                        ],
                    ],
                ],
                'saveToSentItems' => true,
            ];

            $response = Http::withOptions(['verify' => false])
                ->withToken($this->accessToken)
                ->post('https://graph.microsoft.com/v1.0/users/' . config('services.microsoft.sender_upn') . '/sendMail', $message);

            if ($response->successful()) {
                Log::info("Confirmation email sent to {$submission->email} for submission {$submission->reference}");
                return true;
            } else {
                Log::error('Failed to send confirmation email: ' . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Failed to send confirmation email: ' . $e->getMessage());
            return false;
        }
    }

    public function sendDepartmentNotification(Submission $submission): bool
    {
        if (!$this->accessToken) {
            Log::warning('Cannot send email - Microsoft Graph not initialized');
            return false;
        }

        try {
            $department = $submission->dept === Submission::DEPT_ADMISSIONS ? 'Admissions' : 'Registry';
            $subject = "New Document Submission - {$department} - {$submission->reference}";
            $body = view('emails.department-notification', compact('submission'))->render();

            $notificationEmail = $submission->dept === Submission::DEPT_ADMISSIONS 
                ? config('mail.admissions_notify', 'admissions@costaatt.edu.tt')
                : config('mail.registry_notify', 'registry@costaatt.edu.tt');

            $message = [
                'message' => [
                    'subject' => $subject,
                    'body' => [
                        'contentType' => 'HTML',
                        'content' => $body,
                    ],
                    'toRecipients' => [
                        [
                            'emailAddress' => [
                                'address' => $notificationEmail,
                            ],
                        ],
                    ],
                ],
                'saveToSentItems' => true,
            ];

            $response = Http::withOptions(['verify' => false])
                ->withToken($this->accessToken)
                ->post('https://graph.microsoft.com/v1.0/users/' . config('services.microsoft.sender_upn') . '/sendMail', $message);

            if ($response->successful()) {
                Log::info("Department notification sent to {$notificationEmail} for submission {$submission->reference}");
                return true;
            } else {
                Log::error('Failed to send department notification: ' . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Failed to send department notification: ' . $e->getMessage());
            return false;
        }
    }

    public function sendTestEmail(string $to, string $subject = 'Test Email'): bool
    {
        if (!$this->accessToken) {
            Log::warning('Cannot send email - Microsoft Graph not initialized');
            return false;
        }

        try {
            $body = '<p>This is a test email from the COSTAATT Student Document Upload System.</p>';

            $message = [
                'message' => [
                    'subject' => $subject,
                    'body' => [
                        'contentType' => 'HTML',
                        'content' => $body,
                    ],
                    'toRecipients' => [
                        [
                            'emailAddress' => [
                                'address' => $to,
                            ],
                        ],
                    ],
                ],
                'saveToSentItems' => true,
            ];

            $response = Http::withOptions(['verify' => false])
                ->withToken($this->accessToken)
                ->post('https://graph.microsoft.com/v1.0/users/' . config('services.microsoft.sender_upn') . '/sendMail', $message);

            if ($response->successful()) {
                Log::info("Test email sent to {$to}");
                return true;
            } else {
                Log::error('Failed to send test email: ' . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Failed to send test email: ' . $e->getMessage());
            return false;
        }
    }

    // New method for upload confirmation emails
    public function sendUploadConfirmation(string $to, string $studentId, string $programme, string $docType, string $studentName): bool
    {
        if (!$this->accessToken) {
            Log::warning('Cannot send email - Microsoft Graph not initialized');
            return false;
        }

        try {
            $subject = "COSTAATT {$programme}: Document Uploaded Successfully";
            $body = view('emails.upload_confirmation', [
                'student_id' => $studentId,
                'programme' => $programme,
                'doc_type' => $docType,
                'student_name' => $studentName,
            ])->render();

            $message = [
                'message' => [
                    'subject' => $subject,
                    'body' => [
                        'contentType' => 'HTML',
                        'content' => $body,
                    ],
                    'toRecipients' => [
                        [
                            'emailAddress' => [
                                'address' => $to,
                            ],
                        ],
                    ],
                ],
                'saveToSentItems' => true,
            ];

            $response = Http::withOptions(['verify' => false])
                ->withToken($this->accessToken)
                ->post('https://graph.microsoft.com/v1.0/users/' . config('services.microsoft.sender_upn') . '/sendMail', $message);

            if ($response->successful()) {
                Log::info("Upload confirmation email sent to {$to} for document {$docType}");
                return true;
            } else {
                Log::error('Failed to send upload confirmation email: ' . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Failed to send upload confirmation email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send upload failure notification email
     */
    public function sendUploadFailureNotification(string $to, string $studentId, string $programme, string $docType, string $studentName, string $errorMessage, int $attempts = 1): bool
    {
        if (!$this->accessToken) {
            Log::warning('Cannot send upload failure email - no access token');
            return false;
        }

        try {
            $subject = "Document Upload Failed - COSTAATT Student Portal";
            $htmlContent = $this->generateUploadFailureEmailHtml($studentName, $studentId, $programme, $docType, $errorMessage, $attempts);
            $textContent = $this->generateUploadFailureEmailText($studentName, $studentId, $programme, $docType, $errorMessage, $attempts);

            $response = Http::withToken($this->accessToken)
                ->withOptions(['verify' => false])
                ->post('https://graph.microsoft.com/v1.0/users/' . config('services.microsoft.sender_upn') . '/sendMail', [
                    'message' => [
                        'subject' => $subject,
                        'body' => [
                            'contentType' => 'HTML',
                            'content' => $htmlContent
                        ],
                        'toRecipients' => [
                            [
                                'emailAddress' => [
                                    'address' => $to
                                ]
                            ]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                Log::info("Upload failure notification sent to {$to} for document {$docType} (attempt {$attempts})");
                return true;
            } else {
                Log::error('Failed to send upload failure notification: ' . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Failed to send upload failure notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate HTML content for upload failure email
     */
    protected function generateUploadFailureEmailHtml(string $studentName, string $studentId, string $programme, string $docType, string $errorMessage, int $attempts): string
    {
        $maxAttempts = 3;
        $remainingAttempts = $maxAttempts - $attempts;
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Document Upload Failed</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .error-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .retry-info { background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .contact-info { background: #e0f2fe; border: 1px solid #b3e5fc; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>⚠️ Document Upload Failed</h1>
                    <p>COSTAATT Student Document Upload System</p>
                </div>
                
                <div class='content'>
                    <h2>Hello {$studentName},</h2>
                    
                    <p>We encountered an issue while uploading your document. Here are the details:</p>
                    
                    <div class='error-box'>
                        <h3>📄 Document Details:</h3>
                        <ul>
                            <li><strong>Student ID:</strong> {$studentId}</li>
                            <li><strong>Programme:</strong> {$programme}</li>
                            <li><strong>Document Type:</strong> {$docType}</li>
                            <li><strong>Attempt:</strong> {$attempts} of {$maxAttempts}</li>
                        </ul>
                        
                        <h3>❌ Error Message:</h3>
                        <p style='font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px;'>{$errorMessage}</p>
                    </div>
                    
                    " . ($remainingAttempts > 0 ? "
                    <div class='retry-info'>
                        <h3>🔄 What You Can Do:</h3>
                        <ul>
                            <li>You have <strong>{$remainingAttempts} more attempt(s)</strong> to upload this document</li>
                            <li>Please check your file format (must be PDF)</li>
                            <li>Ensure your file size is under 10MB</li>
                            <li>Check your internet connection</li>
                            <li>Try uploading again using the 'Retry' button</li>
                        </ul>
                    </div>
                    " : "
                    <div class='error-box'>
                        <h3>🚫 Maximum Attempts Reached</h3>
                        <p>You have reached the maximum number of upload attempts for this document. Please contact our support team for assistance.</p>
                    </div>
                    ") . "
                    
                    <div class='contact-info'>
                        <h3>📞 Need Help?</h3>
                        <p>If you continue to experience issues, please contact our support team:</p>
                        <ul>
                            <li><strong>Email:</strong> <a href='mailto:admissions@costaatt.edu.tt'>admissions@costaatt.edu.tt</a></li>
                            <li><strong>Phone:</strong> (868) 625-5030</li>
                            <li><strong>Hours:</strong> Monday - Friday, 8:00 AM - 4:00 PM</li>
                        </ul>
                    </div>
                    
                    <p style='margin-top: 30px;'>
                        <a href='" . url('/student-docs/admissions/checklist/' . $studentId) . "' class='btn'>Try Upload Again</a>
                    </p>
                </div>
                
                <div class='footer'>
                    <p>This is an automated message from the COSTAATT Student Document Upload System.</p>
                    <p>Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Generate text content for upload failure email
     */
    protected function generateUploadFailureEmailText(string $studentName, string $studentId, string $programme, string $docType, string $errorMessage, int $attempts): string
    {
        $maxAttempts = 3;
        $remainingAttempts = $maxAttempts - $attempts;
        
        return "
DOCUMENT UPLOAD FAILED - COSTAATT Student Portal

Hello {$studentName},

We encountered an issue while uploading your document. Here are the details:

DOCUMENT DETAILS:
- Student ID: {$studentId}
- Programme: {$programme}
- Document Type: {$docType}
- Attempt: {$attempts} of {$maxAttempts}

ERROR MESSAGE:
{$errorMessage}

" . ($remainingAttempts > 0 ? "
WHAT YOU CAN DO:
- You have {$remainingAttempts} more attempt(s) to upload this document
- Please check your file format (must be PDF)
- Ensure your file size is under 10MB
- Check your internet connection
- Try uploading again using the 'Retry' button
" : "
MAXIMUM ATTEMPTS REACHED:
You have reached the maximum number of upload attempts for this document. 
Please contact our support team for assistance.
") . "

NEED HELP?
If you continue to experience issues, please contact our support team:
- Email: admissions@costaatt.edu.tt
- Phone: (868) 625-5030
- Hours: Monday - Friday, 8:00 AM - 4:00 PM

Try Upload Again: " . url('/student-docs/admissions/checklist/' . $studentId) . "

This is an automated message from the COSTAATT Student Document Upload System.
Please do not reply to this email.
        ";
    }
}
