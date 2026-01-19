import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const PublicNavbar = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="container flex justify-between items-center h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
            ⚡
          </div>
          <span className="font-bold text-lg hidden sm:inline">Energy AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-blue-400 transition-colors text-sm font-medium"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="hover:text-blue-400 transition-colors text-sm font-medium"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn btn-primary text-sm"
          >
            Signup
          </Link>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};
