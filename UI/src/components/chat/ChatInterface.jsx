import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Mic, Volume2, StopCircle } from 'lucide-react';
import { chatWithAI } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

const ChatInterface = ({ className, onNavigate }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Smart Energy Assistant. How can I help you save energy today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Speech to Text (STT) ---
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition. Please try Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            submitMessage(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // --- Text to Speech (TTS) ---
    const speakMessage = (text) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel(); // Cleanup on unmount
        };
    }, []);

    const suggestions = [
        { type: 'query', label: "Estimate Bill", text: "Estimate my energy bill for the next month based on typical usage." },
        { type: 'query', label: "How does this app work?", text: "How does this application help me save energy?" },
        { type: 'action', label: "Predict Consumption", action: 'forecast' },
        { type: 'action', label: "View Reports", action: 'reports' },
    ];

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'action' && onNavigate) {
            onNavigate(suggestion.action);
        } else if (suggestion.type === 'query') {
            const text = suggestion.text || suggestion.label;
            setInput(text);
            submitMessage(text);
        }
    };

    const submitMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMessage = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatWithAI(userMessage);
            const aiMsg = { role: 'assistant', content: response.content };
            setMessages(prev => [...prev, aiMsg]);

            // Auto-speak short responses? Optional. Let's stick to manual click for now.
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        submitMessage(input);
    };

    return (

        <div className={cn("flex flex-col glass-card h-[600px] w-full max-w-md overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 bg-primary/10 backdrop-blur-md border-b border-white/5 text-foreground flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl text-primary shadow-sm hover:scale-105 transition-transform">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">Energy Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex gap-3 max-w-[85%] animate-fade-in-up",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/5",
                            msg.role === 'user'
                                ? "bg-primary text-primary-foreground shadow-primary/20"
                                : "bg-muted text-muted-foreground"
                        )}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm relative group",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/10"
                                    : "bg-muted/50 border border-white/5 text-foreground rounded-tl-none"
                            )}>
                                <ReactMarkdown
                                    components={{
                                        strong: ({ node, ...props }) => <span className="font-bold text-foreground" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="my-1.5 space-y-1 pl-4 list-disc" {...props} />,
                                        li: ({ node, ...props }) => <li className="marker:text-primary" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>

                                {/* TTS Button for Assistant Messages */}
                                {msg.role === 'assistant' && (
                                    <button
                                        onClick={() => speakMessage(msg.content)}
                                        className="transition-all duration-300 absolute -right-10 top-1 p-2 text-muted-foreground/40 group-hover:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-400/10 rounded-full"
                                        title="Read aloud"
                                    >
                                        <Volume2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 ml-1 block opacity-70">
                                {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 mr-auto animate-fade-in-up">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm border border-white/5">
                            <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"></div>
                        </div>
                    </div>
                )}

                {/* Suggestions Chips */}
                {!isLoading && (
                    <div className="flex flex-wrap gap-2 pt-2 ml-11">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="group inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-all duration-300 hover:bg-primary/15 hover:scale-105 hover:shadow-primary/10 hover:shadow-lg"
                            >
                                {suggestion.type === 'action' && <Send className="mr-1.5 h-3 w-3 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                                {suggestion.label}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>


            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-background/20 backdrop-blur-md border-t border-white/5">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={cn(
                            "p-2.5 rounded-xl transition-all shadow-sm",
                            isListening
                                ? "bg-red-500/10 text-red-500 animate-pulse border border-red-500/20"
                                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                        )}
                        title="Speak query"
                    >
                        {isListening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Ask about energy savings..."}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-input/50 bg-secondary/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
