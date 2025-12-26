import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

import { sendChatMessage } from '../../services/api';

const ChatInterface = ({ className }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: "Hello! I'm your Energy Assistant. Ask me anything about your consumption, trends, or how to save energy." }
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
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Call API
        try {
            const response = await sendChatMessage(userMessage.content);
            const aiResponse = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.content || "Sorry, I couldn't process that."
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "Error connecting to AI." }]);
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

    return (
        <div className={cn("flex h-[calc(100vh-140px)] flex-col rounded-xl border border-border bg-card shadow-sm", className)}>
            <div className="flex items-center border-b border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                    <h3 className="font-semibold text-foreground">Energy Assistant</h3>
                    <p className="text-xs text-muted-foreground">Powered by GenAI</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex max-w-[80%] items-start gap-2 rounded-2xl p-4",
                            msg.role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-foreground rounded-tl-none"
                        )}>
                            {msg.role === 'assistant' && <Bot className="mt-1 h-5 w-5 shrink-0" />}
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            {msg.role === 'user' && <User className="mt-1 h-5 w-5 shrink-0 opacity-70" />}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex w-full justify-start">
                        <div className="flex items-center gap-2 rounded-2xl bg-muted p-4 rounded-tl-none">
                            <Bot className="h-5 w-5 shrink-0" />
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about your energy usage..."
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="rounded-lg bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
