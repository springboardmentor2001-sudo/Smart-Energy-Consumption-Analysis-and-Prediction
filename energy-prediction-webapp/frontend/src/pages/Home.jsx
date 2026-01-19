import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, BarChart3, MessageCircle, Upload } from 'lucide-react';

export const Home = () => {
  const features = [
    {
      icon: <Zap size={32} />,
      title: 'Smart Predictions',
      description: 'Accurate energy consumption forecasting using advanced ML models',
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Real-time Analytics',
      description: 'Monitor your energy usage patterns and trends in real-time',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Detailed Reports',
      description: 'Interactive charts and reports for better insights',
    },
    {
      icon: <MessageCircle size={32} />,
      title: 'AI Chatbot',
      description: 'Get instant answers and predictions via our smart chatbot',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="container py-20 lg:py-32 animate-fadeIn">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Smart Energy
              <span className="text-blue-400"> Prediction</span>
              <br />
              System
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Optimize your energy consumption with AI-powered predictions and
              actionable insights. Save costs while reducing environmental impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/form-prediction" className="btn btn-primary flex items-center gap-2">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link to="/report" className="btn btn-secondary">
                View Reports
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-8 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="text-yellow-400" size={24} />
                  <div className="flex-1 bg-slate-700/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full w-3/4"></div>
                  </div>
                  <span className="text-sm">75%</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-green-400" size={24} />
                  <div className="flex-1 bg-slate-700/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-full w-1/2"></div>
                  </div>
                  <span className="text-sm">50%</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-blue-400" size={24} />
                  <div className="flex-1 bg-slate-700/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-full w-4/5"></div>
                  </div>
                  <span className="text-sm">80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="card text-center hover:bg-slate-700 hover:scale-105 hover:shadow-xl transform transition-all cursor-pointer animate-slideIn"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="text-blue-400 mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="card bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Energy?</h3>
          <p className="text-slate-300 mb-8">
            Join thousands of users saving energy and reducing costs with our AI-powered system.
          </p>
          <Link to="/form-prediction" className="btn btn-primary inline-flex items-center gap-2">
            Start Predicting Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};
