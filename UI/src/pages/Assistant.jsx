import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';

const Assistant = () => {
    return (
        <div className="h-full">
            <h2 className="mb-4 text-2xl font-bold text-foreground">AI Energy Assistant</h2>
            <ChatInterface />
        </div>
    );
};

export default Assistant;
