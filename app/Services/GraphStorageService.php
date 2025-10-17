<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class GraphStorageService
{
    protected $accessToken;

    public function __construct()
    {
        $this->accessToken = $this->getAccessToken();
    }

    /**
     * Get access token using client credentials flow
     */
    protected function getAccessToken()
    {
        try {
            // Check if Microsoft Graph credentials are configured
            if (!config('services.microsoft.client_id') || !config('services.microsoft.client_secret') || !config('services.microsoft.tenant_id')) {
                throw new Exception('Microsoft Graph credentials not configured');
            }

            $url = "https://login.microsoftonline.com/" . config('services.microsoft.tenant_id') . "/oauth2/v2.0/token";

            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->asForm()->post($url, [
                'client_id' => config('services.microsoft.client_id'),
                'client_secret' => config('services.microsoft.client_secret'),
                'scope' => 'https://graph.microsoft.com/.default',
                'grant_type' => 'client_credentials',
            ]);

            if (!$response->successful()) {
                throw new Exception('Graph authentication failed: ' . $response->body());
            }

            $data = $response->json();
            if (!isset($data['access_token'])) {
                throw new Exception('No access token received from Microsoft Graph');
            }

            return $data['access_token'];
        } catch (Exception $e) {
            Log::error('Graph authentication error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify connection to Microsoft Graph and OneDrive
     */
    public function verifyConnection()
    {
        try {
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ])->get('https://graph.microsoft.com/v1.0/me/drive/root');

            if ($response->successful()) {
                return $response->json();
            } else {
                throw new Exception('Graph API request failed: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('Graph connection verification failed: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Upload file to OneDrive
     */
    public function uploadToOneDrive($department, $studentId, $filename, $fileContent)
    {
        try {
            // Determine the folder path based on department
            $folderPath = ($department === 'ADMISSIONS')
                ? config('services.microsoft.upload_root_admissions', 'Admissions')
                : config('services.microsoft.upload_root_registry', 'Registry');

            // Create the endpoint for uploading to pre-existing folder
            $endpoint = "https://graph.microsoft.com/v1.0/me/drive/root:/COSTAATT/{$folderPath}/{$studentId}/{$filename}:/content";

            Log::info("Uploading file to OneDrive", [
                'department' => $department,
                'student_id' => $studentId,
                'filename' => $filename,
                'endpoint' => $endpoint
            ]);

            // Make the upload request using HTTP client
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/octet-stream',
            ])->put($endpoint, $fileContent);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info("File uploaded successfully to OneDrive", [
                    'file_id' => $result['id'] ?? 'unknown',
                    'filename' => $filename
                ]);

                return $result;
            } else {
                throw new Exception('OneDrive upload failed: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('OneDrive upload failed: ' . $e->getMessage(), [
                'department' => $department,
                'student_id' => $studentId,
                'filename' => $filename
            ]);
            
            // Fallback to local storage if OneDrive fails
            Log::info('Falling back to local storage');
            return $this->uploadToLocalStorage($department, $studentId, $filename, $fileContent);
        }
    }

    /**
     * Fallback to local storage when OneDrive is not available
     */
    protected function uploadToLocalStorage($department, $studentId, $filename, $fileContent)
    {
        try {
            $year = now()->year;
            $directory = "{$department}/{$year}/{$studentId}";
            $path = $filename;
            
            // Store file locally
            Storage::disk('onedrive_local')->put("{$directory}/{$path}", $fileContent);
            
            Log::info("File uploaded to local storage as fallback", [
                'department' => $department,
                'student_id' => $studentId,
                'filename' => $filename,
                'path' => "{$directory}/{$path}"
            ]);

            return [
                'id' => 'local_' . uniqid(),
                'name' => $filename,
                'path' => "{$directory}/{$path}",
                'fallback' => true
            ];
        } catch (Exception $e) {
            Log::error('Local storage fallback failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Download file from OneDrive
     */
    public function downloadFromOneDrive($itemId)
    {
        try {
            $endpoint = "https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}/content";
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
            ])->get($endpoint);

            if ($response->successful()) {
                return $response->body();
            } else {
                throw new Exception('Download failed: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('OneDrive download failed: ' . $e->getMessage(), [
                'item_id' => $itemId
            ]);
            throw $e;
        }
    }

    /**
     * Get file information from OneDrive
     */
    public function getFileInfo($itemId)
    {
        try {
            $endpoint = "https://graph.microsoft.com/v1.0/me/drive/items/{$itemId}";
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ])->get($endpoint);

            if ($response->successful()) {
                return $response->json();
            } else {
                throw new Exception('File info retrieval failed: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('OneDrive file info retrieval failed: ' . $e->getMessage(), [
                'item_id' => $itemId
            ]);
            throw $e;
        }
    }

    /**
     * List files in a specific folder
     */
    public function listFilesInFolder($department, $studentId)
    {
        try {
            $folderPath = ($department === 'ADMISSIONS')
                ? config('services.microsoft.upload_root_admissions', 'Admissions')
                : config('services.microsoft.upload_root_registry', 'Registry');

            $endpoint = "https://graph.microsoft.com/v1.0/me/drive/root:/COSTAATT/{$folderPath}/{$studentId}:/children";
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ])->get($endpoint);

            if ($response->successful()) {
                return $response->json();
            } else {
                throw new Exception('Folder listing failed: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('OneDrive folder listing failed: ' . $e->getMessage(), [
                'department' => $department,
                'student_id' => $studentId
            ]);
            throw $e;
        }
    }
}
