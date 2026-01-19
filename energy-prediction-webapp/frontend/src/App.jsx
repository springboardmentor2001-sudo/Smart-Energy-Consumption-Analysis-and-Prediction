import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingChatbot } from './components/FloatingChatbot';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { FormPrediction } from './pages/FormPrediction';
import { UploadPrediction } from './pages/UploadPrediction';
import { Report } from './pages/Report';
import { Chatbot } from './pages/Chatbot';

import './index.css';

function AppContent() {
  const { isDark } = useContext(ThemeContext);

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
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <FloatingChatbot />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/form-prediction" element={<FormPrediction />} />
                  <Route path="/upload-prediction" element={<UploadPrediction />} />
                  <Route path="/report" element={<Report />} />
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
