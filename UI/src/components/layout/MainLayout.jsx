import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, activePage, setActivePage }) => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <Header />
            <main className="min-h-[calc(100vh-64px)] p-6 sm:ml-64 bg-background">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
