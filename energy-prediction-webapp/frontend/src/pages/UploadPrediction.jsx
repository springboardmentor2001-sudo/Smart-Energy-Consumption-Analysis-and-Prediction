import React, { useState } from 'react';
import { predictionService } from '../services/api';
import { FileUpload } from '../components/FileUpload';
import { Toast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Upload, CheckCircle } from 'lucide-react';

export const UploadPrediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    setResults(null);

    try {
      const response = await predictionService.predictFile(file);
      setResults(response.data);
      setToast({ type: 'success', message: `Processed ${response.data.total_rows} rows successfully!` });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'File upload failed' });
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-12 animate-fadeIn">File-Based Prediction</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card animate-slideIn">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Upload size={28} className="text-blue-400" />
              Upload Data
            </h2>
            <FileUpload onFileSelect={handleFileSelect} />
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-slate-300">
              <p className="font-semibold mb-2">Supported Formats:</p>
              <ul className="space-y-1 text-xs">
                <li>• CSV (.csv)</li>
                <li>• Text (.txt)</li>
                <li>• PDF (.pdf)</li>
              </ul>
              <p className="mt-3 text-xs text-slate-400">Max file size: 16MB</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="card animate-slideIn flex items-center justify-center min-h-96">
              <LoadingSpinner message="Processing your file..." />
            </div>
          ) : results ? (
            <div className="space-y-6 animate-slideIn">
              <div className="card bg-gradient-to-br from-green-600/20 to-green-400/10 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={32} className="text-green-400" />
                  <h3 className="text-2xl font-bold">Processing Complete</h3>
                </div>
                <p className="text-slate-300">{results.filename}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="card text-center">
                  <p className="text-slate-400 text-sm">Total Rows</p>
                  <p className="text-3xl font-bold text-blue-400">{results.total_rows}</p>
                </div>
                <div className="card text-center">
                  <p className="text-slate-400 text-sm">Avg Prediction</p>
                  <p className="text-3xl font-bold text-green-400">
                    {results.average_prediction.toFixed(0)} kWh
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-yellow-400">100%</p>
                </div>
              </div>

              <div className="card">
                <h4 className="font-bold mb-4">Detailed Predictions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-2">Row</th>
                        <th className="text-left py-2 px-2">Prediction (kWh)</th>
                        <th className="text-left py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.predictions.slice(0, 10).map((pred) => (
                        <tr key={pred.row} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-2 px-2">#{pred.row + 1}</td>
                          <td className="py-2 px-2 font-semibold">{pred.prediction.toFixed(2)}</td>
                          <td className="py-2 px-2">
                            <span className="text-green-400 text-xs">✓ Success</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.predictions.length > 10 && (
                    <p className="text-center text-slate-400 text-xs py-2">
                      ... and {results.predictions.length - 10} more predictions
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setResults(null)}
                className="btn btn-secondary w-full"
              >
                Upload Another File
              </button>
            </div>
          ) : (
            <div className="card animate-slideIn text-center py-16 text-slate-400">
              <Upload size={48} className="mx-auto mb-4 opacity-50" />
              <p>Upload a file to see predictions</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
