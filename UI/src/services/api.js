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

export const getChartData = async () => {
    try {
        const response = await api.get('/chart-data');
        return response.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
        return [];
    }
};

export const getSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
};

export const saveSettings = async (settings) => {
    try {
        const response = await api.post('/settings', settings);
        return response.data;
    } catch (error) {
        console.error("Error saving settings:", error);
        return { error: "Failed to save settings" };
    }
};

export const chatWithAI = async (message) => {
    try {
        const response = await api.post('/chat', { message });
        return response.data;
    } catch (error) {
        console.error("Error sending chat message:", error);
        return { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server." };
    }
};

export const predictEnergy = async (predictionData, useScaling = true) => {
    try {
        const payload = { ...predictionData, use_scaling: useScaling };
        const response = await axios.post(`${API_BASE_URL}/predict-energy`, payload);
        return response.data;
    } catch (error) {
        console.error("Error predicting energy:", error);
        return null; // Or throw
    }
};

export const batchPredict = async (file, useScaling = true) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('use_scaling', useScaling);
        
        const response = await axios.post(`${API_BASE_URL}/predict-batch`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Batch prediction failed:", error);
        throw error;
    }
};

export default api;
