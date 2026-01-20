import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Power, Sun, Cloud, Users, Lightbulb, Wind, Leaf, Settings, MessageSquare, LogOut, Menu, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Landing Page Component
const LandingPage = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-10 h-10 text-yellow-400" />
          <span className="text-3xl font-bold">SmartEnergy</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onLogin} className="px-6 py-2 border-2 border-white rounded-lg hover:bg-white hover:text-blue-900 transition">
            Login
          </button>
          <button onClick={onRegister} className="px-6 py-2 bg-yellow-400 text-blue-900 rounded-lg font-semibold hover:bg-yellow-300 transition">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Predict. Optimize. <span className="text-yellow-400">Save Energy.</span>
          </h1>
          <p className="text-xl mb-12 text-blue-100">
            AI-powered energy consumption prediction and management for smarter buildings
          </p>

          {/* Energy Icons Animation */}
          <div className="grid grid-cols-4 gap-8 max-w-3xl mx-auto mb-16">
            <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-3">
                <Sun className="w-10 h-10 text-blue-900" />
              </div>
              <span className="text-sm">Solar Ready</span>
            </div>
            <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3s'}}>
              <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mb-3">
                <Wind className="w-10 h-10 text-blue-900" />
              </div>
              <span className="text-sm">HVAC Control</span>
            </div>
            <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}>
              <div className="w-20 h-20 bg-purple-400 rounded-full flex items-center justify-center mb-3">
                <Lightbulb className="w-10 h-10 text-blue-900" />
              </div>
              <span className="text-sm">Smart Lighting</span>
            </div>
            <div className="flex flex-col items-center animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3s'}}>
              <div className="w-20 h-20 bg-blue-400 rounded-full flex items-center justify-center mb-3">
                <Leaf className="w-10 h-10 text-blue-900" />
              </div>
              <span className="text-sm">Eco-Friendly</span>
            </div>
          </div>

          <button onClick={onRegister} className="px-12 py-4 bg-yellow-400 text-blue-900 rounded-full text-xl font-bold hover:bg-yellow-300 transition transform hover:scale-105">
            Start Saving Today →
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Predictions</h3>
            <p className="text-blue-100">Advanced machine learning predicts your energy usage patterns with 95%+ accuracy</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <Power className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Controls</h3>
            <p className="text-blue-100">Control HVAC and lighting systems with intelligent automation</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
            <p className="text-blue-100">Get personalized recommendations and insights from your AI energy advisor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Components
const AuthModal = ({ type, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    squareFootage: '',
    renewableEnergy: 0,
    hasRenewable: false
  });

  const handleSubmit = async () => {
    const endpoint = type === 'login' ? '/login' : '/register';
    
    try {
      const payload = type === 'login' 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            squareFootage: parseFloat(formData.squareFootage),
            renewableEnergy: formData.hasRenewable ? parseFloat(formData.renewableEnergy) : 0
          };

      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (type === 'login') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onSuccess(data.user);
        } else {
          alert('Registration successful! Please login.');
          onClose();
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        <div className="space-y-4">
          {type === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {type === 'register' && (
            <>
              <input
                type="number"
                placeholder="Building Square Footage"
                value={formData.squareFootage}
                onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasRenewable"
                  checked={formData.hasRenewable}
                  onChange={(e) => setFormData({...formData, hasRenewable: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="hasRenewable" className="text-gray-700">Using Renewable Energy?</label>
              </div>

              {formData.hasRenewable && (
                <input
                  type="number"
                  placeholder="Approximate Renewable Energy Usage (kWh)"
                  value={formData.renewableEnergy}
                  onChange={(e) => setFormData({...formData, renewableEnergy: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {type === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [predictions, setPredictions] = useState([]);
  const [averageUsage, setAverageUsage] = useState(0);
  const [todayDate, setTodayDate] = useState('');
  const [weather, setWeather] = useState(null);
  const [settings, setSettings] = useState({
    occupancy: 0,
    isHoliday: false,
    hvacStatus: false,
    lightingStatus: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSettings();
    fetchTodayPredictions();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(API_URL + '/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchTodayPredictions = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/predict/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPredictions(data.predictions);
      setAverageUsage(data.averageUsage);
      setTodayDate(data.todayDate);
      setWeather(data.currentWeather);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
    setLoading(false);
  };

  const updateSettings = async (newSettings) => {
    try {
      await fetch(API_URL + '/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      setSettings(newSettings);
      fetchTodayPredictions();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const toggleHVAC = () => {
    updateSettings({ ...settings, hvacStatus: !settings.hvacStatus });
  };

  const toggleLighting = () => {
    updateSettings({ ...settings, lightingStatus: !settings.lightingStatus });
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');

    try {
      const res = await fetch(API_URL + '/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      
      const aiMessage = { role: 'assistant', content: data.response };
      setChatMessages([...chatMessages, userMessage, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">SmartEnergy Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Avg Usage Today</span>
                    {todayDate && (
                      <span className="text-xs text-gray-400">{todayDate}</span>
                    )}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {averageUsage > 0 ? averageUsage.toFixed(2) : '0.00'} kWh
                </p>
                {settings.hvacStatus && (
                  <span className="text-xs text-green-600 mt-1 block">⚡ HVAC Active (+30%)</span>
                )}
                {settings.lightingStatus && (
                  <span className="text-xs text-yellow-600 mt-1 block">💡 Lights On (+10%)</span>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Sun className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500">Temperature</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {weather ? `${weather.temperature.toFixed(1)}°C` : '--'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cloud className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Humidity</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {weather ? `${weather.humidity}%` : '--'}
                </p>
              </div>
            </div>

            {/* Energy Prediction Graph */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Energy Prediction</h2>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} name="Predicted Usage" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${settings.hvacStatus ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Wind className={`w-6 h-6 ${settings.hvacStatus ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">HVAC System</h3>
                      <p className="text-sm text-gray-500">{settings.hvacStatus ? 'Running' : 'Off'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleHVAC}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings.hvacStatus ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                        settings.hvacStatus ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${settings.lightingStatus ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                      <Lightbulb className={`w-6 h-6 ${settings.lightingStatus ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Lighting</h3>
                      <p className="text-sm text-gray-500">{settings.lightingStatus ? 'On' : 'Off'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleLighting}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                      settings.lightingStatus ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                        settings.lightingStatus ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupancy
                    </label>
                    <input
                      type="number"
                      value={settings.occupancy}
                      onChange={(e) => updateSettings({...settings, occupancy: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Holiday Mode
                    </label>
                    <button
                      onClick={() => updateSettings({...settings, isHoliday: !settings.isHoliday})}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                        settings.isHoliday ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          settings.isHoliday ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant */}
            <div className="bg-white rounded-xl shadow-sm flex flex-col h-[500px]">
              <div className="p-4 border-b flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">AI Assistant</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Ask me about energy predictions!</p>
                    <p className="text-xs mt-2">Try: "What will be the prediction for tomorrow at 6pm?"</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about energy usage..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function SmartEnergyApp() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [showAuth, setShowAuth] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
    setShowAuth(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage
          onLogin={() => setShowAuth('login')}
          onRegister={() => setShowAuth('register')}
        />
      )}

      {currentPage === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}

      {showAuth && (
        <AuthModal
          type={showAuth}
          onClose={() => setShowAuth(null)}
          onSuccess={handleLogin}
        />
      )}
    </>
  );
}