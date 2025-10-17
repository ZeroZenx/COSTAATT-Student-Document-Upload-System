<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function studentChat(Request $request)
    {
        $userMessage = trim(strtolower($request->input('message')));
        $studentId = $request->input('student_id');
        $apiKey = env('OPENAI_API_KEY');

        Log::info('Chatbot request received', [
            'message' => $userMessage,
            'student_id' => $studentId
        ]);

        // --- 1️⃣ CHECK UPLOAD OR SUBMISSION STATUS ---
        if (str_contains($userMessage, 'upload') || str_contains($userMessage, 'status') || str_contains($userMessage, 'did i') || str_contains($userMessage, 'my documents')) {
            if (!$studentId) {
                return response()->json(['reply' => "Please provide your Student ID so I can check your upload status. You can enter your Student ID on the upload form page."]);
            }

            $submission = DB::table('submissions')->where('student_id', $studentId)->first();
            if (!$submission) {
                return response()->json(['reply' => "I couldn't find any record for Student ID {$studentId}. Please make sure it's correct or try uploading your documents again."]);
            }

            $documents = DB::table('documents')->where('submission_id', $submission->id)
                ->select('doc_type', 'created_at', 'original_name')->get();
            $docCount = $documents->count();

            $reply = "Here's what I found for Student ID {$studentId}:\n\n";
            $reply .= "📋 **Submission Details:**\n";
            $reply .= "• Programme: {$submission->programme}\n";
            $reply .= "• Status: {$submission->status}\n";
            $reply .= "• Department: {$submission->dept}\n";
            $reply .= "• Reference Number: {$submission->reference}\n";
            $reply .= "• Documents Uploaded: {$docCount}\n\n";

            if ($docCount > 0) {
                $reply .= "📄 **Uploaded Documents:**\n";
                foreach ($documents as $doc) {
                    $uploadDate = date('M d, Y h:i A', strtotime($doc->created_at));
                    $docTypeFormatted = ucwords(str_replace('_', ' ', $doc->doc_type));
                    $reply .= "• {$docTypeFormatted} - {$uploadDate}\n";
                }
            } else {
                $reply .= "❌ **No documents have been uploaded yet.**\n";
                $reply .= "Please visit the upload page to submit your required documents.";
            }

            return response()->json(['reply' => $reply]);
        }

        // --- 2️⃣ PROGRAMME-BASED REQUIREMENTS ---
        $programmes = DB::table('admissions_checklists')->select('programme')->distinct()
            ->pluck('programme')->map(fn($p) => strtolower($p))->toArray();
        
        $matchedProgramme = collect($programmes)->first(fn($p) => str_contains($userMessage, $p));

        $contextDocs = [];
        $contextText = '';
        
        if ($matchedProgramme) {
            $contextDocs = DB::table('admissions_checklists')
                ->where('programme', 'LIKE', '%' . $matchedProgramme . '%')
                ->where('active', 1)
                ->pluck('doc_type')->toArray();
                
            if (!empty($contextDocs)) {
                $docList = array_map(function($doc) {
                    return '• ' . ucwords(str_replace('_', ' ', $doc));
                }, $contextDocs);
                
                $contextText = "📚 **Required documents for {$matchedProgramme}:**\n" . implode("\n", $docList) . "\n\nAll documents must be in PDF format and under 10MB.";
            }
        }

        // --- 3️⃣ GENERAL HELP QUERIES ---
        if (str_contains($userMessage, 'help') || str_contains($userMessage, 'what can you') || str_contains($userMessage, 'how do i')) {
            $helpText = "🤖 **I can help you with:**\n\n";
            $helpText .= "📋 **Document Requirements** - Ask about specific programmes\n";
            $helpText .= "📊 **Upload Status** - Check your submission progress\n";
            $helpText .= "📚 **Programme Info** - Learn about available programmes\n";
            $helpText .= "❓ **General Questions** - Admissions, Registry, GATE, etc.\n\n";
            $helpText .= "**Try asking:**\n";
            $helpText .= "• \"What documents do I need for Nursing?\"\n";
            $helpText .= "• \"Check my upload status\"\n";
            $helpText .= "• \"What programmes are available?\"";
            
            return response()->json(['reply' => $helpText]);
        }

        // --- 4️⃣ PROGRAMME LIST QUERY ---
        if (str_contains($userMessage, 'programme') && (str_contains($userMessage, 'list') || str_contains($userMessage, 'available'))) {
            $allProgrammes = DB::table('admissions_checklists')
                ->select('programme')
                ->distinct()
                ->where('active', 1)
                ->pluck('programme')
                ->sort()
                ->values();

            if ($allProgrammes->count() > 0) {
                $programmeList = $allProgrammes->map(function($programme) {
                    return '• ' . $programme;
                })->implode("\n");

                $reply = "📚 **Available Programmes:**\n\n" . $programmeList . "\n\n";
                $reply .= "Ask me about document requirements for any specific programme!";
                
                return response()->json(['reply' => $reply]);
            }
        }

        // --- 5️⃣ FALLBACK TO OPENAI ---
        if (!$apiKey) {
            return response()->json(['reply' => "I'm sorry, but I'm not fully configured right now. Please contact the Technology Services Department for assistance."]);
        }

        $systemPrompt = "You are the COSTAATT Student Services Digital Employee (SSDE). You assist students with admissions, document uploads, GATE funding, insurance, registry, and verification processes. 

Be helpful, friendly, and professional. Use the database information when available, otherwise provide clear and concise guidance about COSTAATT processes.

Always encourage students to provide their Student ID for personalized assistance.";

        // Provide intelligent fallback responses based on the message content
        $fallbackResponse = $this->getFallbackResponse($userMessage, $contextText);
        
        try {
            $response = Http::timeout(15)->withOptions([
                'verify' => false, // Disable SSL verification for development
                'connect_timeout' => 10,
            ])->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage],
                    ['role' => 'system', 'content' => $contextText]
                ],
                'max_tokens' => 300,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $reply = $response->json('choices.0.message.content') ?? $fallbackResponse;
                
                // Add context if we have programme-specific information
                if (!empty($contextText)) {
                    $reply = $contextText . "\n\n" . $reply;
                }
                
                return response()->json(['reply' => $reply]);
            } else {
                Log::error('OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                return response()->json(['reply' => $fallbackResponse]);
            }
        } catch (\Exception $e) {
            Log::error('Chatbot OpenAI request failed', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['reply' => $fallbackResponse]);
        }
    }

    private function getFallbackResponse($userMessage, $contextText = '')
    {
        $message = strtolower($userMessage);
        
        // Programme-specific responses
        if (str_contains($message, 'nursing')) {
            return "📚 **General Nursing Requirements:**\n\n• TT ID or Passport\n• Birth Certificate\n• Academic Certificates\n• Two Character References\n• Police Certificate\n• Nursing Council Permit\n\nAll documents must be in PDF format and under 10MB. For more specific information, please contact the Admissions Department.";
        }
        
        if (str_contains($message, 'early childhood')) {
            return "📚 **Early Childhood Care and Education Requirements:**\n\n• TT ID or Passport\n• Birth Certificate\n• Academic Certificates\n• Two Character References\n• Personal Statement\n\nAll documents must be in PDF format and under 10MB. For more information, contact Admissions.";
        }
        
        if (str_contains($message, 'medical lab')) {
            return "📚 **Medical Laboratory Technology Requirements:**\n\n• TT ID or Passport\n• Birth Certificate\n• Academic Certificates\n• Police Certificate\n\nAll documents must be in PDF format and under 10MB. Contact Admissions for details.";
        }
        
        // General help responses
        if (str_contains($message, 'help') || str_contains($message, 'what can you')) {
            return "🤖 **I can help you with:**\n\n📋 Document Requirements for different programmes\n📊 Checking your upload status (provide Student ID)\n📚 Programme information\n❓ General admissions and registry questions\n\n**Try asking:**\n• \"What documents do I need for Nursing?\"\n• \"Check my upload status\"\n• \"What programmes are available?\"\n\n*Note: I'm currently experiencing some technical issues, but I can still provide basic information.*";
        }
        
        if (str_contains($message, 'hello') || str_contains($message, 'hi')) {
            return "👋 Hello! I'm the Student Services Digital Employee.\n\nI can help you with document requirements, programme information, and checking your upload status. What would you like to know?\n\n*Note: I'm currently experiencing some technical issues, but I can still provide basic information.*";
        }
        
        // Default response
        return "I understand you're asking about: \"{$userMessage}\"\n\nI'm currently experiencing some technical difficulties with my AI system, but I can still help you with basic information.\n\n**For immediate assistance, please contact:**\n• Admissions: admissions@costaatt.edu.tt\n• Registry: registry@costaatt.edu.tt\n• Technology Services: tech@costaatt.edu.tt\n\nOr visit our main website at www.costaatt.edu.tt";
    }
}
