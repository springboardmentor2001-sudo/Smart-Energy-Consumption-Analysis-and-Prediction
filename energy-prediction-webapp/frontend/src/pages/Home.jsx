import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, BarChart3, MessageCircle, Upload, Flame, Droplet, Wind } from 'lucide-react';
import { homePageService, quickTipsService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Home = () => {
  const [features, setFeatures] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [stats, setStats] = useState(null);
  const [quickTips, setQuickTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featuresRes, benefitsRes, statsRes, tipsRes] = await Promise.all([
        homePageService.getFeatures(),
        homePageService.getBenefits(),
        homePageService.getStats(),
        quickTipsService.getTips(),
      ]);

      setFeatures(featuresRes.data);
      setBenefits(benefitsRes.data);
      setStats(statsRes.data);
      setQuickTips(tipsRes.data);
    } catch (error) {
      console.error('Failed to fetch home page data:', error);
      // Fallback to static data
      setFeatures([
        { id: 1, icon: 'zap', title: 'Smart Predictions', description: 'Accurate energy consumption forecasting' },
        { id: 2, icon: 'trending-up', title: 'Real-time Analytics', description: 'Monitor your energy usage patterns' },
        { id: 3, icon: 'bar-chart', title: 'Detailed Reports', description: 'Interactive charts and reports' },
        { id: 4, icon: 'message-circle', title: 'AI Chatbot', description: 'Get instant answers' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      zap: <Zap size={40} />,
      'trending-up': <TrendingUp size={40} />,
      'bar-chart': <BarChart3 size={40} />,
      'message-circle': <MessageCircle size={40} />,
      flame: <Flame size={32} className="text-orange-400" />,
      droplet: <Droplet size={32} className="text-blue-400" />,
      wind: <Wind size={32} className="text-cyan-400" />,
    };
    return iconMap[iconName] || <Zap size={40} />;
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading home page..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10"></div>
        <div className="container relative mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
                <Zap size={16} className="text-blue-400" />
                <span className="text-sm text-blue-300">AI-Powered Energy Solution</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Smart Energy
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Prediction</span>
                <br />
                System
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Optimize your energy consumption with AI-powered predictions. Save costs, reduce environmental impact, and make smarter decisions about your energy usage.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/form-prediction" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95">
                  Start Predicting <ArrowRight size={20} />
                </Link>
                <Link to="/report" className="border border-slate-600 hover:border-slate-500 text-slate-200 font-semibold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:bg-slate-700/50">
                  View Reports <BarChart3 size={20} />
                </Link>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 mt-12">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{stats.accuracy}%</p>
                    <p className="text-sm text-slate-400">Accuracy</p>
                  </div>
                  <div className="text-center border-l border-r border-slate-700">
                    <p className="text-2xl font-bold text-cyan-400">{stats.users}+</p>
                    <p className="text-sm text-slate-400">Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats.avg_savings}%</p>
                    <p className="text-sm text-slate-400">Avg Savings</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-8 backdrop-blur">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                    <Zap className="text-yellow-400 flex-shrink-0" size={28} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-2">Average Daily Usage</p>
                      <div className="bg-slate-700/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full w-3/4"></div>
                      </div>
                      <p className="text-sm text-slate-300 mt-1">275 kWh</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                    <TrendingUp className="text-green-400 flex-shrink-0" size={28} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-2">Peak Hours Usage</p>
                      <div className="bg-slate-700/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 to-green-500 h-full w-1/2"></div>
                      </div>
                      <p className="text-sm text-slate-300 mt-1">150 kWh</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                    <BarChart3 className="text-blue-400 flex-shrink-0" size={28} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-2">Monthly Forecast</p>
                      <div className="bg-slate-700/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-full w-4/5"></div>
                      </div>
                      <p className="text-sm text-slate-300 mt-1">8,250 kWh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/30 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to understand and optimize your energy consumption</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-700/50 transform hover:scale-105"
              >
                <div className="text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors">{getIconComponent(feature.icon)}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Save money, protect the environment, and gain full control of your energy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="text-center group">
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full border border-slate-600 group-hover:border-blue-500/50">
                    {getIconComponent(benefit.icon)}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-800/30 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Enter Data', desc: 'Provide your energy usage details' },
              { step: '2', title: 'Analysis', desc: 'Our AI analyzes patterns' },
              { step: '3', title: 'Prediction', desc: 'Get accurate forecasts' },
              { step: '4', title: 'Optimize', desc: 'Reduce costs and emissions' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Energy-Saving Tips</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickTips.map((tip) => (
              <div key={tip.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all group cursor-pointer">
                <div className="text-3xl mb-3">{tip.icon}</div>
                <h3 className="font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">{tip.title}</h3>
                <p className="text-sm text-slate-400">{tip.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/settings" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold">
              View All Tips <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Energy Report Card Section */}
      <section className="py-20 bg-gradient-to-b from-slate-800/30 to-slate-900/50 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Your Energy Grade Card</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Get a comprehensive A-F grade report on your building's energy efficiency with component breakdown and actionable recommendations</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-blue-500/30 rounded-3xl p-8 lg:p-12 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Grade Preview */}
              <div className="text-center lg:text-left">
                <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 mb-6 shadow-lg">
                  <div className="text-6xl font-bold text-white">B+</div>
                  <p className="text-white/80 mt-2">Current Efficiency: 82%</p>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">Know Your Building's Grade</h3>
                <p className="text-slate-400 mb-6">
                  Our Energy Report Card evaluates your building across 5 key areas: HVAC, Lighting, Insulation, Water Heating, and Appliances.
                </p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="text-slate-300">Component-by-component efficiency breakdown</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="text-slate-300">5-month grade progression chart</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="text-slate-300">Personalized improvement roadmap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="text-slate-300">ROI projections for upgrades</span>
                  </li>
                </ul>

                <Link to="/energy-report" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
                  View Your Grade Report <ArrowRight size={20} />
                </Link>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <Zap className="text-yellow-400 mb-3" size={32} />
                  <h4 className="font-bold mb-2 text-slate-100">5 Components</h4>
                  <p className="text-sm text-slate-400">Detailed analysis of each building system</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <TrendingUp className="text-green-400 mb-3" size={32} />
                  <h4 className="font-bold mb-2 text-slate-100">Progress Tracking</h4>
                  <p className="text-sm text-slate-400">Monitor improvements over time</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <BarChart3 className="text-blue-400 mb-3" size={32} />
                  <h4 className="font-bold mb-2 text-slate-100">ROI Analysis</h4>
                  <p className="text-sm text-slate-400">Cost and savings projections</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <Upload className="text-cyan-400 mb-3" size={32} />
                  <h4 className="font-bold mb-2 text-slate-100">Download & Share</h4>
                  <p className="text-sm text-slate-400">Export certificate and share results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">
            <h3 className="text-3xl font-bold mb-4">Ready to Optimize Your Energy?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of users saving energy and reducing costs with our AI-powered prediction system.
            </p>
            <Link to="/form-prediction" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
              Start Free Trial <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
