import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Menu, X, Sun, Moon, LogOut, User, Settings } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'My Grade', path: '/energy-report' },
    { label: 'Upload Prediction', path: '/upload-prediction' },
    { label: 'Form Prediction', path: '/form-prediction' },
    { label: 'Report', path: '/report' },
    { label: 'History', path: '/prediction-history' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Chatbot', path: '/chatbot' },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="container flex justify-between items-center h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
            ⚡
          </div>
          <span className="font-bold text-lg hidden sm:inline">Energy AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated && navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-blue-400 transition-colors text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <User size={20} />
                <span className="hidden sm:inline text-sm">{user?.name || 'User'}</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <hr className="border-slate-600 my-2" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-600 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary text-sm">
              Login
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-700 rounded-lg"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && isAuthenticated && (
        <div className="md:hidden border-t border-slate-700 bg-slate-700/50">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-4 py-2 hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
