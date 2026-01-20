import axios from 'axios';

// Vite exposes environment variables via `import.meta.env`.
// Use `VITE_API_URL` (set in .env or defaults to local backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authService = {
  login: (email, password) =>
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
  
  signup: (email, password, name) =>
    axios.post(`${API_BASE_URL}/auth/signup`, { email, password, name }),
  
  getProfile: () =>
    axios.get(`${API_BASE_URL}/auth/profile`, { headers: getAuthHeader() }),
};

export const predictionService = {
  predictForm: (data) =>
    axios.post(`${API_BASE_URL}/predict/form`, data, {
      headers: getAuthHeader(),
    }),
  
  predictFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/predict/file`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const chatbotService = {
  sendMessage: (message) =>
    axios.post(`${API_BASE_URL}/chatbot/message`, { message }, {
      headers: getAuthHeader(),
    }),
  
  sendVoice: (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return axios.post(`${API_BASE_URL}/chatbot/voice`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getSuggestions: () =>
    axios.get(`${API_BASE_URL}/chatbot/suggestions`, {
      headers: getAuthHeader(),
    }),
};

export const reportService = {
  getSummary: () =>
    axios.get(`${API_BASE_URL}/reports/summary`, {
      headers: getAuthHeader(),
    }),
};

export const modelService = {
  getInfo: () =>
    axios.get(`${API_BASE_URL}/model/info`),
};
export const energyTipsService = {
  getTips: () =>
    axios.get(`${API_BASE_URL}/energy-tips`, {
      headers: getAuthHeader(),
    }),
};

export const userGoalsService = {
  getGoals: () =>
    axios.get(`${API_BASE_URL}/user-goals`, {
      headers: getAuthHeader(),
    }),
  
  updateGoals: (data) =>
    axios.post(`${API_BASE_URL}/user-goals`, data, {
      headers: getAuthHeader(),
    }),
};

export const homePageService = {
  getFeatures: () =>
    axios.get(`${API_BASE_URL}/home-features`),
  
  getBenefits: () =>
    axios.get(`${API_BASE_URL}/home-benefits`),
  
  getStats: () =>
    axios.get(`${API_BASE_URL}/home-stats`),
};

export const predictionHistoryService = {
  getHistory: () =>
    axios.get(`${API_BASE_URL}/prediction-history`, {
      headers: getAuthHeader(),
    }),
};

export const quickTipsService = {
  getTips: () =>
    axios.get(`${API_BASE_URL}/quick-tips`),
};