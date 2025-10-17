<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Submission;
use App\Models\Document;
use App\Models\AdmissionsChecklist;

class ChatbotController extends Controller
{
    public function studentChat(Request $request)
    {
        $userMessage = trim($request->input('message'));
        $studentId = $request->input('student_id');
        $apiKey = env('OPENAI_API_KEY');

        Log::info('Smart Chatbot request received', [
            'message' => $userMessage,
            'student_id' => $studentId
        ]);

        // --- 1️⃣ SMART STUDENT LOOKUP BY NAME OR ID ---
        $studentInfo = $this->findStudentByMessage($userMessage, $studentId);
        if ($studentInfo) {
            return response()->json(['reply' => $this->formatStudentInfo($studentInfo)]);
        }

        // --- 2️⃣ CHECK UPLOAD OR SUBMISSION STATUS ---
        if ($this->isStatusQuery($userMessage)) {
            if (!$studentId) {
                return response()->json(['reply' => "Please provide your Student ID or name so I can check your upload status. You can enter your Student ID on the upload form page."]);
            }

            $submission = $this->getStudentSubmission($studentId);
            if (!$submission) {
                return response()->json(['reply' => "I couldn't find any record for Student ID {$studentId}. Please make sure it's correct or try uploading your documents again."]);
            }

            return response()->json(['reply' => $this->formatSubmissionStatus($submission)]);
        }

        // --- 3️⃣ PROGRAMME-BASED REQUIREMENTS ---
        $programmeInfo = $this->getProgrammeRequirements($userMessage);
        if ($programmeInfo) {
            return response()->json(['reply' => $programmeInfo]);
        }

        // --- 4️⃣ GENERAL HELP QUERIES ---
        if ($this->isHelpQuery($userMessage)) {
            return response()->json(['reply' => $this->getHelpResponse()]);
        }

        // --- 5️⃣ PROGRAMME LIST QUERY ---
        if ($this->isProgrammeListQuery($userMessage)) {
            return response()->json(['reply' => $this->getProgrammeList()]);
        }

        // --- 6️⃣ FALLBACK TO OPENAI ---
        if (!$apiKey) {
            return response()->json(['reply' => $this->getFallbackResponse($userMessage)]);
        }

        $systemPrompt = "You are the COSTAATT Student Services Digital Employee (SSDE). You assist students with admissions, document uploads, GATE funding, insurance, registry, and verification processes. 

Be helpful, friendly, and professional. Use the database information when available, otherwise provide clear and concise guidance about COSTAATT processes.

Always encourage students to provide their Student ID for personalized assistance.";

        try {
            $response = Http::timeout(15)->withOptions([
                'verify' => false,
                'connect_timeout' => 10,
            ])->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage]
                ],
                'max_tokens' => 300,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $reply = $response->json('choices.0.message.content') ?? $this->getFallbackResponse($userMessage);
                return response()->json(['reply' => $reply]);
            } else {
                Log::error('OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json(['reply' => $this->getFallbackResponse($userMessage)]);
            }
        } catch (\Exception $e) {
            Log::error('Chatbot OpenAI request failed', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['reply' => $this->getFallbackResponse($userMessage)]);
        }
    }

    // ===== SMART HELPER METHODS =====

    /**
     * Find student by name or ID in the message
     */
    private function findStudentByMessage($message, $studentId = null)
    {
        $message = strtolower($message);
        
        // Check if message contains a student ID pattern
        if (preg_match('/\b(\d{6,})\b/', $message, $matches)) {
            $foundStudentId = $matches[1];
            $submission = $this->getStudentSubmission($foundStudentId);
            if ($submission) {
                return $submission;
            }
        }
        
        // Check if message contains a reference number pattern
        if (preg_match('/\b(ADM|REG)\d+[A-Z]\d+\b/i', $message, $matches)) {
            $reference = strtoupper($matches[0]);
            $submission = Submission::where('reference', $reference)->withCount('documents')->first();
            if ($submission) {
                return $submission;
            }
        }
        
        // Check if message contains a name pattern (first name + last name)
        if (preg_match('/\b([a-z]+)\s+([a-z]+)\b/', $message, $matches)) {
            $firstName = ucfirst($matches[1]);
            $lastName = ucfirst($matches[2]);
            
            $submission = Submission::where('first_name', 'LIKE', "%{$firstName}%")
                ->where('last_name', 'LIKE', "%{$lastName}%")
                ->withCount('documents')
                ->first();
                
            if ($submission) {
                return $submission;
            }
        }
        
        // Use provided student ID if available
        if ($studentId) {
            return $this->getStudentSubmission($studentId);
        }
        
        return null;
    }

    /**
     * Get student submission by ID
     */
    private function getStudentSubmission($studentId)
    {
        return Submission::where('student_id', $studentId)
            ->withCount('documents')
            ->first();
    }

    /**
     * Check if message is asking about status
     */
    private function isStatusQuery($message)
    {
        $statusKeywords = ['status', 'upload', 'submission', 'progress', 'check', 'my documents', 'did i upload'];
        $message = strtolower($message);
        
        foreach ($statusKeywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if message is asking for help
     */
    private function isHelpQuery($message)
    {
        $helpKeywords = ['help', 'what can you', 'how do i', 'assistance', 'support'];
        $message = strtolower($message);
        
        foreach ($helpKeywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if message is asking for programme list
     */
    private function isProgrammeListQuery($message)
    {
        $message = strtolower($message);
        return (str_contains($message, 'programme') || str_contains($message, 'program')) && 
               (str_contains($message, 'list') || str_contains($message, 'available') || str_contains($message, 'what'));
    }

    /**
     * Get programme requirements
     */
    private function getProgrammeRequirements($message)
    {
        $programmes = DB::table('admissions_checklists')
            ->select('programme')
            ->distinct()
            ->where('active', 1)
            ->pluck('programme')
            ->toArray();
        
        $message = strtolower($message);
        
        // Try to match programme names more flexibly
        $matchedProgramme = null;
        foreach ($programmes as $programme) {
            $programmeLower = strtolower($programme);
            
            // Check if message contains key words from the programme name
            $programmeWords = explode(' ', $programmeLower);
            $matchCount = 0;
            
            foreach ($programmeWords as $word) {
                if (str_contains($message, $word) && strlen($word) > 3) { // Only match words longer than 3 characters
                    $matchCount++;
                }
            }
            
            // If we have at least 2 matching words or the message contains the full programme name
            if ($matchCount >= 2 || str_contains($message, $programmeLower)) {
                $matchedProgramme = $programme;
                break;
            }
        }
        
        if ($matchedProgramme) {
            $contextDocs = DB::table('admissions_checklists')
                ->where('programme', $matchedProgramme)
                ->where('active', 1)
                ->get();
                
            if ($contextDocs->count() > 0) {
                $requiredDocs = $contextDocs->where('required', true)->pluck('doc_type')->unique();
                $optionalDocs = $contextDocs->where('required', false)->pluck('doc_type')->unique();
                
                $reply = "📚 **Required documents for {$matchedProgramme}:**\n\n";
                
                if ($requiredDocs->count() > 0) {
                    $reply .= "**Required:**\n";
                    foreach ($requiredDocs as $doc) {
                        $reply .= "• " . ucwords(str_replace('_', ' ', $doc)) . "\n";
                    }
                }
                
                if ($optionalDocs->count() > 0) {
                    $reply .= "\n**Optional:**\n";
                    foreach ($optionalDocs as $doc) {
                        $reply .= "• " . ucwords(str_replace('_', ' ', $doc)) . "\n";
                    }
                }
                
                $reply .= "\nAll documents must be in PDF format and under 10MB.";
                return $reply;
            }
        }
        
        return null;
    }

    /**
     * Format student information response
     */
    private function formatStudentInfo($submission)
    {
        $department = $submission->dept === 'ADMISSIONS' ? 'Admissions' : 'Registry';
        $statusDisplay = ucwords(str_replace('_', ' ', $submission->status));
        $submissionDate = date('M d, Y', strtotime($submission->created_at));
        
        $reply = "👤 **Student Information Found**\n\n";
        $reply .= "**Name:** {$submission->first_name} {$submission->last_name}\n";
        $reply .= "**Student ID:** {$submission->student_id}\n";
        $reply .= "**Email:** {$submission->email}\n";
        $reply .= "**Department:** {$department}\n";
        $reply .= "**Programme:** {$submission->programme}\n";
        $reply .= "**Status:** {$statusDisplay}\n";
        $reply .= "**Reference:** {$submission->reference}\n";
        $reply .= "**Documents Uploaded:** {$submission->documents_count}\n";
        $reply .= "**Submitted:** {$submissionDate}\n\n";
        
        if ($submission->documents_count > 0) {
            $documents = Document::where('submission_id', $submission->id)
                ->select('doc_type', 'created_at', 'original_name')
                ->get();
                
            $reply .= "📄 **Uploaded Documents:**\n";
            foreach ($documents as $doc) {
                $uploadDate = date('M d, Y', strtotime($doc->created_at));
                $docTypeFormatted = ucwords(str_replace('_', ' ', $doc->doc_type));
                $reply .= "• {$docTypeFormatted} - {$uploadDate}\n";
            }
        } else {
            $reply .= "❌ **No documents uploaded yet.**\n";
            $reply .= "Please visit the upload page to submit your required documents.";
        }
        
        return $reply;
    }

    /**
     * Format submission status response
     */
    private function formatSubmissionStatus($submission)
    {
        $department = $submission->dept === 'ADMISSIONS' ? 'Admissions' : 'Registry';
        $statusDisplay = ucwords(str_replace('_', ' ', $submission->status));
        $submissionDate = date('M d, Y', strtotime($submission->created_at));
        
        $reply = "📋 **Submission Status Update**\n\n";
        $reply .= "**Student:** {$submission->first_name} {$submission->last_name}\n";
        $reply .= "**Department:** {$department}\n";
        $reply .= "**Status:** {$statusDisplay}\n";
        $reply .= "**Reference:** {$submission->reference}\n";
        $reply .= "**Documents Uploaded:** {$submission->documents_count}\n";
        $reply .= "**Submitted:** {$submissionDate}\n\n";
        
        $statusMessages = [
            'IN_PROGRESS' => 'Your submission is currently in progress. You can still upload additional documents.',
            'SUBMITTED' => 'Your submission has been received and is being reviewed by our team.',
            'PROCESSING' => 'Your submission is being processed. We will notify you once it\'s complete.',
            'COMPLETED' => 'Your submission has been completed successfully! You will receive further instructions via email.'
        ];
        
        $reply .= $statusMessages[$submission->status] ?? "Your submission status is: {$statusDisplay}";
        
        if ($submission->status === 'IN_PROGRESS') {
            $reply .= "\n\n💡 You can continue uploading documents until your submission is complete.";
        } elseif ($submission->status === 'COMPLETED') {
            $reply .= "\n\n✅ Congratulations! Your submission has been processed successfully.";
        }
        
        $contactEmail = $submission->dept === 'ADMISSIONS' ? 'admissions@costaatt.edu.tt' : 'registry@costaatt.edu.tt';
        $reply .= "\n\nNeed more help? Contact us at {$contactEmail}";
        
        return $reply;
    }

    /**
     * Get help response
     */
    private function getHelpResponse()
    {
        return "🤖 **I can help you with:**\n\n" .
               "👤 **Student Lookup** - Find your information by name or Student ID\n" .
               "📋 **Document Requirements** - Ask about specific programmes\n" .
               "📊 **Upload Status** - Check your submission progress\n" .
               "📚 **Programme Info** - Learn about available programmes\n" .
               "❓ **General Questions** - Admissions, Registry, GATE, etc.\n\n" .
               "**Try asking:**\n" .
               "• \"Find John Smith\" or \"Student ID 123456\"\n" .
               "• \"What documents do I need for Nursing?\"\n" .
               "• \"Check my upload status\"\n" .
               "• \"What programmes are available?\"";
    }

    /**
     * Get programme list
     */
    private function getProgrammeList()
    {
        $programmes = DB::table('admissions_checklists')
            ->select('programme')
            ->distinct()
            ->where('active', 1)
            ->pluck('programme')
            ->sort()
            ->values();

        if ($programmes->count() > 0) {
            $programmeList = $programmes->map(function($programme) {
                return '• ' . $programme;
            })->implode("\n");

            return "📚 **Available Programmes:**\n\n" . $programmeList . "\n\n" .
                   "Ask me about document requirements for any specific programme!";
        }
        
        return "I couldn't find any programmes in the database. Please contact the Admissions Department for assistance.";
    }

    /**
     * Get fallback response
     */
    private function getFallbackResponse($userMessage)
    {
        $message = strtolower($userMessage);
        
        if (str_contains($message, 'hello') || str_contains($message, 'hi')) {
            return "👋 Hello! I'm the Student Services Digital Employee.\n\n" .
                   "I can help you with document requirements, programme information, and checking your upload status. " .
                   "What would you like to know?";
        }
        
        return "I understand you're asking about: \"{$userMessage}\"\n\n" .
               "I'm here to help! I can assist you with:\n" .
               "• Finding your student information (provide name or Student ID)\n" .
               "• Document requirements for programmes\n" .
               "• Checking your submission status\n" .
               "• General questions about COSTAATT processes\n\n" .
               "**For immediate assistance, please contact:**\n" .
               "• Admissions: admissions@costaatt.edu.tt\n" .
               "• Registry: registry@costaatt.edu.tt\n" .
               "• Technology Services: tech@costaatt.edu.tt";
    }
}
