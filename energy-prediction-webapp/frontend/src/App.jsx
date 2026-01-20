import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingChatbot } from './components/FloatingChatbot';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { PredictionHistory } from './pages/PredictionHistory';
import { Settings } from './pages/Settings';
import { EnergyReportCard } from './pages/EnergyReportCard';
import { FormPrediction } from './pages/FormPrediction';
import { UploadPrediction } from './pages/UploadPrediction';
import { Report } from './pages/Report';
import { Chatbot } from './pages/Chatbot';
import { Reviews } from './pages/Reviews';

import './index.css';

function AppContent() {
  const { isDark } = useContext(ThemeContext);
  const { isAuthenticated } = useContext(AuthContext);

  // Apply theme class to HTML element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-200" style={{
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a'
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <FloatingChatbot />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/prediction-history" element={<PredictionHistory />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/energy-report" element={<EnergyReportCard />} />
                  <Route path="/form-prediction" element={<FormPrediction />} />
                  <Route path="/upload-prediction" element={<UploadPrediction />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
