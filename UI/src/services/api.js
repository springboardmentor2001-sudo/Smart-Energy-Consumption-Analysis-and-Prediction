import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSummary = async () => {
    try {
        const response = await api.get('/summary');
        return response.data;
    } catch (error) {
        console.error("Error fetching summary:", error);
        return null;
    }
};

export const getDeviceUsage = async () => {
    try {
        const response = await api.get('/device-usage');
        return response.data;
    } catch (error) {
        console.error("Error fetching device usage:", error);
        return [];
    }
};

export const sendChatMessage = async (message) => {
    try {
        const response = await api.post('/chat', { message });
        return response.data;
    } catch (error) {
        console.error("Error sending chat message:", error);
        return { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server." };
    }
};

export default api;
