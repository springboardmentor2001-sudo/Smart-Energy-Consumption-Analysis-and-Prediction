import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Zap, TrendingDown, BarChart3, Flame, Droplet, Wind, ArrowRight, Check } from 'lucide-react';
import { PublicNavbar } from '../components/PublicNavbar';
import { ThemeContext } from '../context/ThemeContext';

export const Landing = () => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-blue-50 via-white to-slate-50'
    }`}>
      <PublicNavbar />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
            isDark 
              ? 'bg-blue-500/10 border border-blue-500/30' 
              : 'bg-blue-100 border border-blue-300'
          }`}>
            <Zap size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Smart Energy Management</span>
          </div>
          
          <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Reduce Your Energy Bills by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Up to 30%</span>
          </h1>
          
          <p className={`text-xl mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Predict your energy consumption with AI-powered insights and optimize your usage patterns. Join 2,400+ users already saving thousands on their energy bills.
          </p>

          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/signup"
              className={`font-semibold py-4 px-8 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300' 
                  : 'border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          <div className={`rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <p className="text-3xl font-bold text-blue-400 mb-2">92%</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Prediction Accuracy</p>
          </div>
          <div className={`rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <p className="text-3xl font-bold text-cyan-400 mb-2">2,400+</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Users</p>
          </div>
          <div className={`rounded-xl p-6 text-center ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <p className="text-3xl font-bold text-emerald-400 mb-2">$50M+</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Savings Achieved</p>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="relative">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-full">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Upload Data</h3>
              <p className="text-slate-400 text-sm">Upload your energy consumption data or fill out a simple form with your details.</p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 h-full">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">AI Analysis</h3>
              <p className="text-slate-400 text-sm">Our advanced machine learning models analyze your patterns and predict future consumption.</p>
            </div>
          </div>

          <div className="relative">
            <div className={`rounded-2xl p-6 h-full ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'}`}>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Get Insights</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Receive detailed reports and recommendations to optimize your energy usage.</p>
            </div>
          </div>

          <div className="relative">
            <div className={`rounded-2xl p-6 h-full ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'}`}>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Save Money</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Implement recommendations and start saving up to 30% on your energy bills.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className={`text-4xl font-bold text-center mb-12 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Powerful Features</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Feature 1 */}
          <div className={`rounded-2xl p-8 hover:border-blue-500/50 transition-all ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <BarChart3 className="text-white" size={28} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Accurate Predictions</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Our AI model achieves 92% accuracy using advanced machine learning algorithms trained on thousands of data points.</p>
          </div>

          {/* Feature 2 */}
          <div className={`rounded-2xl p-8 hover:border-blue-500/50 transition-all ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <TrendingDown className="text-white" size={28} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Cost Savings</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Get detailed recommendations to reduce your energy consumption and save up to 30% on your monthly bills.</p>
          </div>

          {/* Feature 3 */}
          <div className={`rounded-2xl p-8 hover:border-blue-500/50 transition-all ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <Flame className="text-white" size={28} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Real-time Analytics</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Monitor your energy usage in real-time with interactive charts and detailed insights about your consumption patterns.</p>
          </div>

          {/* Feature 4 */}
          <div className={`rounded-2xl p-8 hover:border-blue-500/50 transition-all ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <Wind className="text-white" size={28} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Eco-Friendly</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Reduce your carbon footprint while saving money. Our system helps you make environmentally responsible decisions.</p>
          </div>
        </div>
      </div>

      {/* What You Get After Login */}
      <div className="container mx-auto px-4 py-16">
        <h2 className={`text-4xl font-bold text-center mb-12 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>What You'll Get After Login</h2>
        
        <div className={`max-w-2xl mx-auto rounded-2xl p-12 ${isDark ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-300'}`}>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Check className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Form-Based Predictions</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Enter your building details to get instant energy consumption predictions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Check className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Batch File Uploads</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Upload CSV or PDF files to get predictions for multiple locations at once</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Check className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Detailed Analytics & Reports</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>View comprehensive reports with charts, trends, and cost breakdown analysis</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Check className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>AI Chatbot Support</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Get answers to your energy-related questions using our intelligent AI chatbot</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Check className="text-emerald-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>User Reviews & Community</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>See what other users are saying and share your own experience with the platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className={`rounded-3xl p-12 text-center backdrop-blur-sm ${
          isDark 
            ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30' 
            : 'bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300'
        }`}>
          <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Ready to Start Saving?</h3>
          <p className={`mb-8 max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Join thousands of users who are already using Smart Energy Prediction System to reduce their energy bills and help the environment.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Sign Up for Free
            </Link>
            <Link
              to="/login"
              className={`font-semibold py-3 px-8 rounded-lg transition-all ${
                isDark 
                  ? 'border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300' 
                  : 'border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t mt-20 py-8 ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-600'}`}>
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 Smart Energy Prediction System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
