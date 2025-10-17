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
}
