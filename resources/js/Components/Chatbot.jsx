import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hello! I can help you check the status of your document submission. Please provide your Student ID or Reference Number.',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Check if input looks like a student ID (numbers) or reference number (starts with ADM/REG)
            const isStudentId = /^\d+$/.test(inputValue.trim());
            const isReferenceNumber = /^(ADM|REG)\d+[A-Z]\d+$/.test(inputValue.trim());

            if (!isStudentId && !isReferenceNumber) {
                const errorMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: 'Please provide a valid Student ID (numbers only) or Reference Number (format: ADM123456A789 or REG123456A789).',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsLoading(false);
                return;
            }

            // Search for submission
            const searchParam = isStudentId ? 'student_id' : 'reference';
            const response = await fetch(`/api/chatbot/search?${searchParam}=${encodeURIComponent(inputValue.trim())}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            
            if (data.submission) {
                const statusMessage = getStatusMessage(data.submission);
                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: statusMessage,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                const notFoundMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: 'No submission found with that Student ID or Reference Number. Please check your information and try again.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, notFoundMessage]);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error while searching. Please try again later or contact the admissions office directly.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
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

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                type: 'bot',
                content: 'Hello! I can help you check the status of your document submission. Please provide your Student ID or Reference Number.',
                timestamp: new Date()
            }
        ]);
    };

    return (
        <>
            {/* Chatbot Toggle Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200"
                    title="Check Submission Status"
                >
                    {isOpen ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Submission Status Bot</h3>
                            <p className="text-sm text-blue-100">Get instant updates on your documents</p>
                        </div>
                        <button
                            onClick={clearChat}
                            className="text-blue-100 hover:text-white text-sm"
                            title="Clear Chat"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                                    <div className={`text-xs mt-1 ${
                                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                        <span className="text-sm">Searching...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter Student ID or Reference Number..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors duration-200"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Enter your Student ID (e.g., 123456) or Reference Number (e.g., ADM123456A789)
                        </p>
                    </form>
                </div>
            )}
        </>
    );
}

