import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send } from 'lucide-react';

export default function StudentServicesDigitalEmployee() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "Hi there! 👋 I'm the Student Services Digital Employee. I can help you with uploading your documents, understanding programme requirements, or checking the status of your submissions." 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        const userInput = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            // Check if input looks like a student ID or reference number
            const isStudentId = /^\d+$/.test(userInput);
            const isReferenceNumber = /^(ADM|REG)\d+[A-Z]\d+$/.test(userInput);
            
            if (isStudentId || isReferenceNumber) {
                // Search for submission status
                const searchParam = isStudentId ? 'student_id' : 'reference';
                const res = await axios.get(`/api/chatbot/search?${searchParam}=${encodeURIComponent(userInput)}`);
                
                if (res.data.submission) {
                    const statusMessage = getStatusMessage(res.data.submission);
                    setMessages(prev => [...prev, { role: 'assistant', content: statusMessage }]);
                } else {
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: "No submission found with that Student ID or Reference Number. Please check your information and try again." 
                    }]);
                }
            } else {
                // Handle general questions
                const reply = getGeneralResponse(userInput);
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I'm having trouble responding right now. Please try again later or contact the Technology Services Department." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getStatusMessage = (submission) => {
        const statusMessages = {
            'IN_PROGRESS': 'Your submission is currently in progress. You can still upload additional documents.',
            'SUBMITTED': 'Your submission has been received and is being reviewed by our team.',
            'PROCESSING': 'Your submission is being processed. We will notify you once it\'s complete.',
            'COMPLETED': 'Your submission has been completed successfully! You will receive further instructions via email.'
        };

        const statusDisplay = {
            'IN_PROGRESS': 'In Progress',
            'SUBMITTED': 'Submitted',
            'PROCESSING': 'Processing',
            'COMPLETED': 'Completed'
        };

        const department = submission.dept === 'ADMISSIONS' ? 'Admissions' : 'Registry';
        const documentsCount = submission.documents_count || 0;
        const submissionDate = new Date(submission.created_at).toLocaleDateString();

        return `📋 **Submission Status Update**

**Student:** ${submission.first_name} ${submission.last_name}
**Department:** ${department}
**Status:** ${statusDisplay[submission.status]}
**Reference:** ${submission.reference}
**Documents Uploaded:** ${documentsCount}
**Submitted:** ${submissionDate}

${statusMessages[submission.status]}

${submission.status === 'IN_PROGRESS' ? '💡 You can continue uploading documents until your submission is complete.' : ''}
${submission.status === 'COMPLETED' ? '✅ Congratulations! Your submission has been processed successfully.' : ''}

Need more help? Contact us at ${submission.dept === 'ADMISSIONS' ? 'admissions@costaatt.edu.tt' : 'registry@costaatt.edu.tt'}`;
    };

    const getGeneralResponse = (input) => {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('document') && lowerInput.includes('requirement')) {
            return `📄 **Document Requirements**

For **Admissions**, you typically need:
• Birth Certificate
• Academic Transcripts
• National ID Card
• Passport Photo
• Character Reference
• Medical Certificate
• GATE Approval Letter (if applicable)

For **Registry**, you typically need:
• Official Offer Letter
• Signed Acceptance Form
• Medical Form
• Student Photo
• GATE Approval or Payment Proof

All documents must be in PDF format and under 10MB each.`;
        }
        
        if (lowerInput.includes('status') || lowerInput.includes('check')) {
            return `🔍 **Check Your Status**

To check your submission status, please provide:
• Your Student ID (numbers only, e.g., 123456)
• Your Reference Number (e.g., ADM123456A789 or REG123456A789)

I'll give you a detailed update on your submission!`;
        }
        
        if (lowerInput.includes('programme') || lowerInput.includes('program')) {
            return `🎓 **Available Programmes**

We offer various programmes including:
• Early Childhood Care and Education (BA)
• Medical Laboratory Technology (AAS, BSc)
• Medical Ultrasound (AdvDip)
• Radiography (BSc)
• Environmental Health (AAS, BSc)
• Occupational Safety and Health (AAS, BSc)
• Social Work (BSW)
• General Nursing (AAS, BSc)
• Psychiatric Nursing (AAS, BSc)

For more details, visit our website or contact admissions@costaatt.edu.tt`;
        }
        
        if (lowerInput.includes('help') || lowerInput.includes('support')) {
            return `🆘 **How Can I Help?**

I can assist you with:
• Checking your submission status
• Document requirements
• Programme information
• General questions about the upload process

Just ask me anything or provide your Student ID/Reference Number for status updates!`;
        }
        
        return `I'm here to help! I can assist you with:
• Checking your submission status (provide Student ID or Reference Number)
• Document requirements
• Programme information
• General questions

What would you like to know?`;
    };

    const formatMessage = (content) => {
        // Simple formatting for line breaks and lists
        return content.split('\n').map((line, index) => (
            <div key={index}>
                {line.startsWith('-') || line.startsWith('•') ? (
                    <div className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{line.substring(1).trim()}</span>
                    </div>
                ) : (
                    <span>{line}</span>
                )}
            </div>
        ));
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setOpen(!open)}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-all duration-200 hover:scale-105"
                    title="Student Services Digital Employee"
                >
                    <MessageCircle size={24} />
                </button>
            </div>

            {/* Chat Window */}
            {open && (
                <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-50 max-h-96">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm">Student Services Digital Employee</h3>
                            <p className="text-xs opacity-90">COSTAATT Assistant</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto text-sm space-y-3 max-h-64">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        message.role === 'assistant'
                                            ? 'bg-blue-50 text-gray-800 border border-blue-100'
                                            : 'bg-blue-600 text-white'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap">
                                        {formatMessage(message.content)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-blue-50 text-gray-800 border border-blue-100 p-3 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ask me anything about your documents..."
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="mt-2 flex flex-wrap gap-1">
                            <button
                                onClick={() => setInput("What documents do I need to upload?")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                            >
                                📄 Requirements
                            </button>
                            <button
                                onClick={() => setInput("Check my upload status")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                            >
                                🔍 Check Status
                            </button>
                            <button
                                onClick={() => setInput("What programmes are available?")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                            >
                                🎓 Programmes
                            </button>
                            <button
                                onClick={() => setInput("Help")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                            >
                                🆘 Help
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
