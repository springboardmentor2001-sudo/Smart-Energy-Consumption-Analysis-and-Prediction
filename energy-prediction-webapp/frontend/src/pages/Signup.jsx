import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { PublicNavbar } from '../components/PublicNavbar';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    if (!name.trim()) {
      setToast({ type: 'error', message: 'Please enter your name' });
      return;
    }

    setLoading(true);

    try {
      const success = await signup(email, password, name);

      if (success) {
        setToast({ type: 'success', message: 'Signup successful! Redirecting to home...' });
        setTimeout(() => navigate('/'), 2000);
      } else {
        setToast({ type: 'error', message: 'Signup failed. Try again!' });
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
              <p className="text-slate-400 text-sm">Create Your Account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 pointer-events-none">
                    <User className="text-blue-400 group-focus-within:text-blue-300 transition-colors" size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

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
                    placeholder="your@email.com"
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
                    placeholder="Enter password"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 pointer-events-none">
                    <Lock className="text-blue-400 group-focus-within:text-blue-300 transition-colors" size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
