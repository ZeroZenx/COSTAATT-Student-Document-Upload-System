import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send } from 'lucide-react';

export default function StudentServicesDigitalEmployee() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "Hi there! 👋 I'm the Student Services Digital Employee. I can help you with:\n\n• Finding student information by name or ID\n• Document requirements for programmes\n• Checking submission status\n• Programme information\n\nJust ask me anything or try the quick actions below!" 
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
            // Get student ID from localStorage if available
            const studentId = localStorage.getItem('student_id');
            
            // Send to smart chatbot backend
            const response = await axios.post('/api/chatbot/student', {
                message: userInput,
                student_id: studentId
            });
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.data.reply 
            }]);
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
                                placeholder="Ask me anything or search for a student..."
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
                                onClick={() => setInput("Find John Smith")}
                                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                            >
                                👤 Find Student
                            </button>
                            <button
                                onClick={() => setInput("What documents do I need for Nursing?")}
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
