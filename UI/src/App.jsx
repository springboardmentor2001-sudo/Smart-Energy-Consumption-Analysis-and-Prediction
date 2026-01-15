import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Forecast from './pages/Forecast';
import Devices from './pages/Devices';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import ChatInterface from './components/chat/ChatInterface';
import Settings from './pages/Settings';
import { Bot, X } from 'lucide-react';

import Login from './pages/Login';

function App() {
    // Auth State - Default to false for demo
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(true);

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setActivePage('dashboard'); // Reset page
    };

    const handleNavigate = (page) => {
        setActivePage(page);
        // On mobile or if floating chat is open, we might want to auto-close it
        // or keep it open. Fore now, let's keep it open if it was open.
        // But if navigating TO assistant, we close floating chat because full page opens.
        if (page === 'assistant') {
            setIsChatOpen(false);
        }
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'devices': return <Devices />;
            case 'forecast': return <Forecast />;
            case 'insights': return <Insights />;
            case 'reports': return <Reports />;
            case 'assistant': return <Assistant onNavigate={handleNavigate} />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    }

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <MainLayout
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
        >
            {renderPage()}

            {/* Floating Chat Popup */}
            {isChatOpen && activePage !== 'assistant' && (
                <div className="fixed bottom-24 right-6 w-[350px] sm:w-[500px] z-50">
                    <ChatInterface
                        className="h-[600px] shadow-2xl border-primary/20"
                        onNavigate={handleNavigate}
                    />
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
