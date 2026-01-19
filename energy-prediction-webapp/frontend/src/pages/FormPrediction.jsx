import React, { useState } from 'react';
import { predictionService } from '../services/api';
import { Toast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Zap, Thermometer, Droplets, Home, Wind, Clock, Cloud } from 'lucide-react';

export const FormPrediction = () => {
  const [formData, setFormData] = useState({
    temperature: 20,
    humidity: 50,
    square_footage: 5000,
    month: 1,
    hvac_appliances: 1,
    hvac_type: 'central-ac',
    season: 'spring',
    time: 12,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const response = await predictionService.predictForm(formData);
      setPrediction(response.data);
      setToast({ type: 'success', message: 'Prediction successful!' });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Prediction failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-12 animate-fadeIn">Form-Based Prediction</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card animate-slideIn">
            <h2 className="text-2xl font-bold mb-6">Energy Parameters</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Thermometer size={20} className="text-red-400" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  min="-10"
                  max="50"
                  step="0.5"
                  className="input-field"
                />
                <p className="text-xs text-slate-400 mt-1">{formData.temperature}°C</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Droplets size={20} className="text-blue-400" />
                  Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="input-field"
                />
                <p className="text-xs text-slate-400 mt-1">{formData.humidity}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Home size={20} className="text-green-400" />
                  Square Footage (sqft)
                </label>
                <input
                  type="number"
                  name="square_footage"
                  value={formData.square_footage}
                  onChange={handleChange}
                  min="100"
                  max="100000"
                  step="100"
                  className="input-field"
                />
                <p className="text-xs text-slate-400 mt-1">{formData.square_footage} sqft</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Month</label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="input-field"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleDateString('en', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Wind size={20} className="text-blue-400" />
                  HVAC Appliances
                </label>
                <input
                  type="number"
                  name="hvac_appliances"
                  value={formData.hvac_appliances}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  step="1"
                  className="input-field"
                />
                <p className="text-xs text-slate-400 mt-1">{formData.hvac_appliances} unit(s)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Wind size={20} className="text-cyan-400" />
                  HVAC Type
                </label>
                <select
                  name="hvac_type"
                  value={formData.hvac_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="central-ac">Central Air Conditioner</option>
                  <option value="window-ac">Window AC Unit</option>
                  <option value="furnace">Furnace</option>
                  <option value="heat-pump">Heat Pump</option>
                  <option value="boiler">Boiler</option>
                  <option value="split-ac">Split AC System</option>
                  <option value="portable-ac">Portable AC</option>
                  <option value="hybrid">Hybrid System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Cloud size={20} className="text-gray-400" />
                  Season
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="winter">Winter</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall/Monsoon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock size={20} className="text-orange-400" />
                  Time of Day (Hour)
                </label>
                <input
                  type="number"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  min="0"
                  max="23"
                  step="1"
                  className="input-field"
                />
                <p className="text-xs text-slate-400 mt-1">{String(formData.time).padStart(2, '0')}:00</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Predicting...' : 'Get Prediction'}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="card animate-slideIn flex items-center justify-center min-h-96">
              <LoadingSpinner message="Calculating energy prediction..." />
            </div>
          ) : prediction ? (
            <div className="space-y-6 animate-slideIn">
              <div className="card bg-gradient-to-br from-blue-600/20 to-blue-400/10 border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Predicted Energy Consumption</h3>
                  <Zap className="text-yellow-400" size={32} />
                </div>
                <div className="text-5xl font-bold text-blue-400 mb-2">
                  {prediction.prediction.toFixed(2)}
                  <span className="text-2xl text-slate-400 ml-2">{prediction.unit}</span>
                </div>
                <p className="text-slate-300">Daily energy consumption estimate</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <p className="text-slate-400 text-sm">Confidence Level</p>
                  <p className="text-xl font-bold text-green-400">{prediction.confidence}</p>
                </div>
                <div className="card">
                  <p className="text-slate-400 text-sm">Model Accuracy</p>
                  <p className="text-xl font-bold text-blue-400">92%</p>
                </div>
              </div>

              <div className="card">
                <h4 className="font-semibold mb-3">Input Parameters Used</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Temperature</p>
                    <p className="font-semibold">{prediction.input_data.temperature}°C</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Humidity</p>
                    <p className="font-semibold">{prediction.input_data.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Building Size</p>
                    <p className="font-semibold">{prediction.input_data.square_footage} sqft</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Month</p>
                    <p className="font-semibold">Month {prediction.input_data.month}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">HVAC Appliances</p>
                    <p className="font-semibold">{prediction.input_data.hvac_appliances || formData.hvac_appliances} unit(s)</p>
                  </div>
                  <div>
                    <p className="text-slate-400">HVAC Type</p>
                    <p className="font-semibold capitalize">{(prediction.input_data.hvac_type || formData.hvac_type).replace(/-/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Season</p>
                    <p className="font-semibold capitalize">{prediction.input_data.season || formData.season}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Time of Day</p>
                    <p className="font-semibold">{String(prediction.input_data.time || formData.time).padStart(2, '0')}:00</p>
                  </div>
                </div>
              </div>

              <div className="card border-l-4 border-l-green-500 bg-green-500/5">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">💡 Tip:</span> Based on the current parameters,
                  consider optimizing your HVAC settings to reduce energy consumption.
                </p>
              </div>
            </div>
          ) : (
            <div className="card animate-slideIn text-center py-16 text-slate-400">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p>Fill in the form and click "Get Prediction" to see results</p>
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
