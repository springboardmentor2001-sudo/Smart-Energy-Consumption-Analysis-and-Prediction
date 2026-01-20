// Chatbot JavaScript - WORKING VERSION
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    // Add user message to chat
    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `<div class="message user">${msg}</div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'message bot typing';
    typing.textContent = 'Typing...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    
    try {
        // Call Gemini API
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        
        const data = await res.json();
        
        // Remove typing indicator
        messages.removeChild(typing);
        
        // Add bot response
        messages.innerHTML += `<div class="message bot">${data.reply}</div>`;
        messages.scrollTop = messages.scrollHeight;
        
    } catch (error) {
        messages.removeChild(typing);
        messages.innerHTML += `<div class="message bot">❌ Error: ${error.message}</div>`;
        messages.scrollTop = messages.scrollHeight;
    }
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
