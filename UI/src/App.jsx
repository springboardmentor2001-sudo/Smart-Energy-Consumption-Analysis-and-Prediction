import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import ChatInterface from './components/chat/ChatInterface';
import { Bot, Settings, Zap, LineChart, Lightbulb, FileText, X } from 'lucide-react';

function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [isChatOpen, setIsChatOpen] = useState(false);

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'devices': return <div className="p-10 text-center text-muted-foreground">Devices Page (Coming Soon)</div>;
            case 'forecast': return <div className="p-10 text-center text-muted-foreground">Forecast Page (Coming Soon)</div>;
            case 'insights': return <div className="p-10 text-center text-muted-foreground">Insights Page (Coming Soon)</div>;
            case 'reports': return <div className="p-10 text-center text-muted-foreground">Reports Page (Coming Soon)</div>;
            case 'assistant': return <Assistant />;
            case 'settings': return <div className="p-10 text-center text-muted-foreground">Settings Page (Coming Soon)</div>;
            default: return <Dashboard />;
        }
    }

    return (
        <MainLayout activePage={activePage} setActivePage={setActivePage}>
            {renderPage()}

            {/* Floating Chat Popup */}
            {isChatOpen && activePage !== 'assistant' && (
                <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] z-50">
                    <ChatInterface className="h-[500px] shadow-2xl border-primary/20" />
                </div>
            )}

            {/* Floating Toggle Button */}
            {activePage !== 'assistant' && (
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary shadow-xl hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-transform hover:scale-105 z-50"
                >
                    {isChatOpen ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
                </button>
            )}
        </MainLayout>
    );
}

export default App;
