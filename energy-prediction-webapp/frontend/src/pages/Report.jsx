import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EnergyChart } from '../components/Chart';
import { TrendingUp, Calendar, BarChart3, Zap } from 'lucide-react';
import { format } from 'date-fns';

export const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('90');
  const [chartType, setChartType] = useState('area');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await reportService.getSummary();
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-96">
        <LoadingSpinner message="Loading report data..." />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container py-12 text-center text-slate-400">
        <p>Failed to load report data</p>
      </div>
    );
  }

  // Transform data for charts
  const chartData = reportData.dates.map((date, idx) => ({
    name: format(new Date(date), 'MMM dd'),
    value: Math.round(reportData.predictions[idx]),
  }));

  const comparisonData = reportData.dates.map((date, idx) => ({
    name: format(new Date(date), 'MMM dd'),
    predicted: Math.round(reportData.predictions[idx]),
    actual: Math.round(reportData.actual[idx]),
  }));

  return (
    <div className="container py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <h1 className="text-4xl font-bold">Energy Reports</h1>
        <button onClick={fetchReportData} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Daily Consumption</p>
              <p className="text-3xl font-bold text-blue-400">
                {reportData.average_daily_consumption.toFixed(0)} kWh
              </p>
            </div>
            <Zap size={32} className="text-yellow-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Peak Consumption</p>
              <p className="text-3xl font-bold text-red-400">
                {reportData.peak_consumption.toFixed(0)} kWh
              </p>
            </div>
            <TrendingUp size={32} className="text-red-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Efficiency Trend</p>
              <p className="text-3xl font-bold text-green-400">
                {reportData.efficiency_trend === 'improving' ? '↑' : '↓'} {reportData.efficiency_trend}
              </p>
            </div>
            <BarChart3 size={32} className="text-green-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Analysis Period</p>
              <p className="text-3xl font-bold text-cyan-400">{dateRange} days</p>
            </div>
            <Calendar size={32} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold">Energy Consumption Trend</h3>
            <div className="flex gap-2">
              {['area', 'line', 'bar'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    chartType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <EnergyChart data={chartData} type={chartType} />
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold mb-6">Predicted vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Predicted"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h4 className="font-bold mb-4">Model Performance</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Accuracy</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 h-2 rounded overflow-hidden">
                    <div className="bg-green-500 h-full w-full"></div>
                  </div>
                  <span className="font-semibold">92%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Precision</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 h-2 rounded overflow-hidden">
                    <div className="bg-blue-500 h-full w-11/12"></div>
                  </div>
                  <span className="font-semibold">89%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Reliability</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 h-2 rounded overflow-hidden">
                    <div className="bg-yellow-500 h-full w-5/6"></div>
                  </div>
                  <span className="font-semibold">83%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-bold mb-4">Recommendations</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Optimize HVAC settings during peak hours</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span>
                <span>Schedule maintenance in off-peak periods</span>
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-400">!</span>
                <span>Monitor humidity levels closely</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span>Consider renewable energy sources</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
