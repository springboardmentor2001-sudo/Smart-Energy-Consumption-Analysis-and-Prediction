import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { Mail, Lock, Zap } from 'lucide-react';
import { PublicNavbar } from '../components/PublicNavbar';

export const Login = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        setToast({ type: 'success', message: 'Login successful!' });
        setTimeout(() => navigate('/'), 2000);
      } else {
        setToast({ type: 'error', message: 'Authentication failed' });
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200" style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <PublicNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-full">
                    <Zap size={28} className="text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Energy AI</h1>
              <p className="text-slate-400 text-sm">Smart Energy Prediction System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 pointer-events-none">
                    <Mail className="text-blue-400 group-focus-within:text-blue-300 transition-colors" size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@example.com"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">Password</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 pointer-events-none">
                    <Lock className="text-blue-400 group-focus-within:text-blue-300 transition-colors" size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Create one
              </a>
            </p>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="text-xs text-slate-500">DEMO</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-sm text-slate-300">
              <p className="font-semibold text-blue-400 mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-slate-400">
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  Email: demo@example.com
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  Password: password123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
