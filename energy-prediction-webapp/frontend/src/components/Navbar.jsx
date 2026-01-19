import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Upload Prediction', path: '/upload-prediction' },
    { label: 'Form Prediction', path: '/form-prediction' },
    { label: 'Report', path: '/report' },
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
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors flex items-center gap-2"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
