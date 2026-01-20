import React, { useState } from 'react';
import { BarChart3, Download, Trash2 } from 'lucide-react';

export const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([
    {
      id: 1,
      date: '2026-01-16',
      temperature: 45,
      humidity: 65,
      squareFootage: 2400,
      prediction: 12450,
      status: 'Completed'
    },
    {
      id: 2,
      date: '2026-01-15',
      temperature: 42,
      humidity: 72,
      squareFootage: 2400,
      prediction: 13200,
      status: 'Completed'
    },
    {
      id: 3,
      date: '2026-01-14',
      temperature: 50,
      humidity: 58,
      squareFootage: 2400,
      prediction: 11800,
      status: 'Completed'
    },
    {
      id: 4,
      date: '2026-01-13',
      temperature: 38,
      humidity: 80,
      squareFootage: 2400,
      prediction: 14200,
      status: 'Completed'
    },
    {
      id: 5,
      date: '2026-01-12',
      temperature: 48,
      humidity: 62,
      squareFootage: 2400,
      prediction: 12100,
      status: 'Completed'
    },
  ]);

  const handleDelete = (id) => {
    setPredictions(predictions.filter(p => p.id !== id));
  };

  const handleDownloadPDF = (prediction) => {
    const pdfContent = `
      Energy Prediction Report
      ========================
      Date: ${prediction.date}
      
      Input Parameters:
      - Temperature: ${prediction.temperature}°F
      - Humidity: ${prediction.humidity}%
      - Square Footage: ${prediction.squareFootage} sq ft
      
      Prediction Result: ${prediction.prediction.toLocaleString()} kWh
      Status: ${prediction.status}
      
      This prediction was generated on ${new Date().toLocaleDateString()}
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdfContent));
    element.setAttribute('download', `prediction_${prediction.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Prediction History</h1>
        <p className="text-slate-400">View and manage all your past energy predictions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-blue-400 mb-2">{predictions.length}</p>
          <p className="text-sm text-slate-400">Total Predictions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-emerald-400 mb-2">
            {(predictions.reduce((sum, p) => sum + p.prediction, 0) / 1000).toFixed(1)}k
          </p>
          <p className="text-sm text-slate-400">Total Energy (kWh)</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-cyan-400 mb-2">
            {(predictions.reduce((sum, p) => sum + p.prediction, 0) / predictions.length).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </p>
          <p className="text-sm text-slate-400">Average Prediction</p>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        {predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Temperature</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Humidity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Square Footage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Prediction (kWh)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-200">{prediction.date}</td>
                    <td className="px-6 py-4 text-slate-200">{prediction.temperature}°F</td>
                    <td className="px-6 py-4 text-slate-200">{prediction.humidity}%</td>
                    <td className="px-6 py-4 text-slate-200">{prediction.squareFootage.toLocaleString()} sq ft</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                        {prediction.prediction.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">
                        {prediction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleDownloadPDF(prediction)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                        title="Download as PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(prediction.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-red-400 hover:text-red-300"
                        title="Delete prediction"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <BarChart3 size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No predictions yet. Create your first prediction!</p>
          </div>
        )}
      </div>
    </div>
  );
};
