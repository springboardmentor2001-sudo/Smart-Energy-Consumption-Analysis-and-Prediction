import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children, activePage, setActivePage, onLogout, isDarkMode, toggleTheme }) => {
    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <Navbar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                onLogout={onLogout}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
            />
            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 fade-in">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
