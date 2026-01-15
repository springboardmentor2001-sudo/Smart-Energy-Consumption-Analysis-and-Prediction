import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import { Bot, Sparkles } from 'lucide-react';

const Assistant = ({ onNavigate }) => {
    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="rounded-2xl glass-card p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Energy Assistant</h1>
                        <p className="text-muted-foreground">Ask questions about your consumption, get saving tips, or analyze your habits.</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chat Area - Main Focus */}
                <div className="lg:col-span-2">
                    <ChatInterface className="h-[600px] w-full" onNavigate={onNavigate} />
                </div>

                {/* Info / Quick Prompts Sidebar */}
                <div className="space-y-4">
                    <div className="rounded-2xl glass-card p-5 border border-white/20">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            Suggested Questions
                        </h3>
                        <div className="space-y-2">
                            {[
                                "How can I reduce my AC bill?",
                                "What's the best temperature for sleep?",
                                "Analyze my current usage pattern.",
                                "Tips for holiday energy saving?"
                            ].map((prompt, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left p-3 rounded-xl hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/10"
                                    onClick={() => {
                                        // Optional: Logic to pre-fill chat
                                    }}
                                >
                                    "{prompt}"
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-5 border border-primary/10">
                        <h4 className="font-semibold text-primary mb-2">Did you know?</h4>
                        <p className="text-sm text-muted-foreground">
                            Smart thermostats can save up to 10-12% on heating and 15% on cooling costs annually.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
