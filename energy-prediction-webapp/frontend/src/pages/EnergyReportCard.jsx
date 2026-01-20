import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Download, Share2, TrendingUp, Award, Zap, Home, Droplets, Wind } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const EnergyReportCard = () => {
  const { isDark } = useContext(ThemeContext);
  const [selectedMonth, setSelectedMonth] = useState('December');

  // Calculate grade based on efficiency percentage
  const calculateGrade = (efficiency) => {
    if (efficiency >= 90) return { grade: 'A+', color: 'from-emerald-600 to-emerald-500', textColor: 'text-emerald-500', bgColor: 'bg-emerald-50', darkBgColor: 'dark:bg-emerald-950' };
    if (efficiency >= 85) return { grade: 'A', color: 'from-emerald-600 to-emerald-400', textColor: 'text-emerald-500', bgColor: 'bg-emerald-50', darkBgColor: 'dark:bg-emerald-950' };
    if (efficiency >= 80) return { grade: 'B+', color: 'from-blue-600 to-blue-400', textColor: 'text-blue-500', bgColor: 'bg-blue-50', darkBgColor: 'dark:bg-blue-950' };
    if (efficiency >= 75) return { grade: 'B', color: 'from-blue-600 to-cyan-400', textColor: 'text-blue-500', bgColor: 'bg-blue-50', darkBgColor: 'dark:bg-blue-950' };
    if (efficiency >= 70) return { grade: 'C+', color: 'from-yellow-600 to-yellow-400', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50', darkBgColor: 'dark:bg-yellow-950' };
    if (efficiency >= 60) return { grade: 'C', color: 'from-yellow-600 to-orange-400', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50', darkBgColor: 'dark:bg-yellow-950' };
    if (efficiency >= 50) return { grade: 'D', color: 'from-orange-600 to-orange-400', textColor: 'text-orange-600', bgColor: 'bg-orange-50', darkBgColor: 'dark:bg-orange-950' };
    return { grade: 'F', color: 'from-red-600 to-red-400', textColor: 'text-red-600', bgColor: 'bg-red-50', darkBgColor: 'dark:bg-red-950' };
  };

  // Mock data for current building
  const currentEfficiency = 82;
  const gradeInfo = calculateGrade(currentEfficiency);

  // Component efficiency breakdown
  const components = [
    { 
      name: 'HVAC System', 
      efficiency: 82, 
      max: 95, 
      icon: Wind,
      tips: [
        'Schedule annual maintenance',
        'Clean or replace filters monthly',
        'Upgrade to programmable thermostat'
      ]
    },
    { 
      name: 'Lighting', 
      efficiency: 92, 
      max: 100, 
      icon: Zap,
      tips: [
        'Replace remaining incandescent bulbs',
        'Install motion sensors in low-use areas',
        'Utilize natural daylight'
      ]
    },
    { 
      name: 'Insulation', 
      efficiency: 78, 
      max: 100, 
      icon: Home,
      tips: [
        'Seal air leaks around windows/doors',
        'Add weatherstripping to gaps',
        'Consider attic insulation upgrade'
      ]
    },
    { 
      name: 'Water Heating', 
      efficiency: 72, 
      max: 90, 
      icon: Droplets,
      tips: [
        'Lower water heater temp to 120°F',
        'Install low-flow showerheads',
        'Insulate hot water pipes'
      ]
    },
    { 
      name: 'Appliances', 
      efficiency: 88, 
      max: 100, 
      icon: Award,
      tips: [
        'Run full loads in dishwasher/laundry',
        'Replace old appliances with ENERGY STAR',
        'Unplug devices when not in use'
      ]
    }
  ];

  // Grade history data (5 months)
  const gradeHistory = [
    { month: 'August', grade: 'D', value: 65 },
    { month: 'September', grade: 'C+', value: 72 },
    { month: 'October', grade: 'C', value: 68 },
    { month: 'November', grade: 'B', value: 78 },
    { month: 'December', grade: 'B+', value: 82 }
  ];

  // Top recommendations with ROI
  const recommendations = [
    {
      priority: 1,
      title: 'Upgrade HVAC System',
      description: 'Install high-efficiency HVAC unit with smart controls',
      cost: '$4,500-6,000',
      savings: '$600-800/year',
      timeline: '2-3 months ROI',
      impact: '+8% efficiency'
    },
    {
      priority: 2,
      title: 'Improve Insulation',
      description: 'Seal air leaks and upgrade attic insulation',
      cost: '$2,000-3,000',
      savings: '$300-500/year',
      timeline: '4-6 months ROI',
      impact: '+6% efficiency'
    },
    {
      priority: 3,
      title: 'Optimize Water Heating',
      description: 'Install tankless water heater and low-flow fixtures',
      cost: '$2,500-3,500',
      savings: '$250-400/year',
      timeline: '6-10 months ROI',
      impact: '+8% efficiency'
    }
  ];

  // Calculate points to next grade
  const pointsNeeded = currentEfficiency >= 90 ? 0 : (Math.ceil(currentEfficiency / 5) * 5) + 5 - currentEfficiency;

  // Download certificate
  const handleDownloadCertificate = () => {
    const certificateText = `
╔════════════════════════════════════════════════════════════════╗
║                    ENERGY EFFICIENCY CERTIFICATE              ║
║                      Smart Energy Prediction                   ║
╚════════════════════════════════════════════════════════════════╝

BUILDING PERFORMANCE ASSESSMENT

Current Grade: ${gradeInfo.grade}
Overall Efficiency: ${currentEfficiency}%
Assessment Date: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT BREAKDOWN:

${components.map(comp => `
${comp.name}
  Efficiency: ${comp.efficiency}% (Grade: ${calculateGrade(comp.efficiency).grade})
  Status: ${comp.efficiency >= 90 ? 'Excellent' : comp.efficiency >= 80 ? 'Good' : 'Needs Improvement'}
`).join('')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRADE PROGRESSION:
${gradeHistory.map(item => `  ${item.month}: ${item.grade} (${item.value}%)`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP RECOMMENDATIONS:

${recommendations.map((rec, idx) => `
${idx + 1}. ${rec.title}
   Cost: ${rec.cost}
   Annual Savings: ${rec.savings}
   ROI Timeline: ${rec.timeline}
   Efficiency Impact: ${rec.impact}
`).join('')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
• Review component-specific recommendations above
• Prioritize improvements based on ROI timeline
• Schedule professional energy audit (recommended)
• Implement low-cost/no-cost improvements first
• Track progress monthly

Generated by Smart Energy Prediction System
For more information, visit our dashboard.

╚════════════════════════════════════════════════════════════════╝
    `.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(certificateText));
    element.setAttribute('download', `Energy_Certificate_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300 py-8 px-4`}>
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Energy Grade Report Card
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Monitor your building's energy efficiency performance
          </p>
        </div>

        {/* Main Grade Card */}
        <div className={`bg-gradient-to-r ${gradeInfo.color} rounded-2xl p-8 mb-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-lg mb-2">Your Current Grade</p>
              <h2 className="text-7xl font-bold mb-4">{gradeInfo.grade}</h2>
              <p className="text-white/90 text-xl">Overall Efficiency: {currentEfficiency}%</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold opacity-20">{gradeInfo.grade}</div>
              <p className="text-white/80 mt-4">Based on 5 component analysis</p>
            </div>
          </div>

          {/* Progress to next grade */}
          {currentEfficiency < 100 && (
            <div className="mt-6 pt-6 border-t border-white/30">
              <p className="text-white/80 text-sm mb-2">Points to next grade: {pointsNeeded.toFixed(1)}</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentEfficiency % 5) / 5 * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button 
            onClick={handleDownloadCertificate}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Download size={20} />
            Download Certificate
          </button>
          <button 
            onClick={() => navigator.share && navigator.share({
              title: 'My Energy Grade',
              text: `I achieved a ${gradeInfo.grade} grade on my building energy efficiency! Check yours with Smart Energy Prediction.`,
              url: window.location.href
            })}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            <Share2 size={20} />
            Share Grade
          </button>
        </div>

        {/* Component Breakdown */}
        <div className="mb-8">
          <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Component Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {components.map((comp, idx) => {
              const compGrade = calculateGrade(comp.efficiency);
              const CompIcon = comp.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-lg p-4 ${isDark ? compGrade.darkBgColor : compGrade.bgColor} border-2 border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-105`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CompIcon size={24} className={compGrade.textColor} />
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{comp.name}</p>
                  </div>
                  
                  <p className={`text-3xl font-bold mb-2 ${compGrade.textColor}`}>{compGrade.grade}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {comp.efficiency}%
                      </span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Max {comp.max}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${compGrade.color}`}
                        style={{ width: `${(comp.efficiency / comp.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <p className="font-semibold mb-1">Tips:</p>
                    <ul className="space-y-1">
                      {comp.tips.slice(0, 2).map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade History */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 mb-8 shadow-lg`}>
          <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Grade Progress (5 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#cbd5e1'} />
              <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: `2px solid ${isDark ? '#475569' : '#cbd5e1'}` }}
                labelStyle={{ color: isDark ? '#f1f5f9' : '#000' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Recommendations */}
        <div className="mb-8">
          <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Top Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {rec.priority}
                      </span>
                      <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rec.title}
                      </h4>
                    </div>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{rec.description}</p>
                  </div>
                  <TrendingUp className="text-green-500 flex-shrink-0" size={24} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                      COST
                    </p>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {rec.cost}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                      ANNUAL SAVINGS
                    </p>
                    <p className="font-bold text-green-500">{rec.savings}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                      ROI
                    </p>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rec.timeline}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                      IMPACT
                    </p>
                    <p className="font-bold text-blue-500">{rec.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-700' : 'bg-gradient-to-r from-blue-50 to-cyan-50'} rounded-lg p-8 text-center border-2 border-blue-500`}>
          <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ready to improve your grade?
          </h3>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6 max-w-2xl mx-auto`}>
            Get personalized recommendations and track your progress month-over-month. Every improvement counts!
          </p>
          <button className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}>
            View Detailed Plan
          </button>
        </div>
      </div>
    </div>
  );
};
