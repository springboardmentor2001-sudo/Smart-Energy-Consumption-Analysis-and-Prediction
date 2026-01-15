import React from 'react';
import { Bell, User, Sun, Moon } from 'lucide-react';

const Header = ({ isCollapsed, isDarkMode, toggleTheme }) => {
    return (
        <header className="sticky top-0 z-30 w-full glass border-b border-white/10">
            <div className={`flex items-center justify-between p-4 transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
                {/* pl-64 to offset sidebar width on desktop */}
                <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-foreground">Overview</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 pr-4">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium text-foreground hidden md:block">Rahul Rai</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
