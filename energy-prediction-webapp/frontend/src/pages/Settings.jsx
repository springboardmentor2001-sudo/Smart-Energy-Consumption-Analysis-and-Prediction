import React, { useState, useEffect } from 'react';
import { Lightbulb, Target, Trophy, TrendingDown } from 'lucide-react';
import { Toast } from '../components/Toast';
import { energyTipsService, userGoalsService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Settings = () => {
  const [monthlyGoal, setMonthlyGoal] = useState(15000);
  const [newGoal, setNewGoal] = useState(15000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [toast, setToast] = useState(null);
  const [energyTips, setEnergyTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalLoading, setGoalLoading] = useState(false);
  const currentUsage = 12450;
  const goalProgress = (currentUsage / monthlyGoal) * 100;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tipsRes, goalsRes] = await Promise.all([
        energyTipsService.getTips(),
        userGoalsService.getGoals(),
      ]);
      
      setEnergyTips(tipsRes.data);
      setMonthlyGoal(goalsRes.data.monthly_goal);
      setNewGoal(goalsRes.data.monthly_goal);
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
      setToast({ type: 'error', message: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (newGoal < 5000) {
      setToast({ type: 'error', message: 'Goal must be at least 5000 kWh' });
      return;
    }

    try {
      setGoalLoading(true);
      await userGoalsService.updateGoals({ monthly_goal: newGoal });
      setMonthlyGoal(newGoal);
      setIsEditingGoal(false);
      setToast({ type: 'success', message: 'Monthly goal updated successfully!' });
    } catch (error) {
      console.error('Failed to update goal:', error);
      setToast({ type: 'error', message: 'Failed to update goal' });
    } finally {
      setGoalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Settings & Goals</h1>
        <p className="text-slate-400">Manage your monthly goals and energy-saving tips</p>
      </div>

      {/* Monthly Goal Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-100">
          <Target size={28} className="text-blue-400" />
          Monthly Energy Goal
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Goal Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Current Usage This Month</p>
              <p className="text-4xl font-bold text-slate-100">{currentUsage.toLocaleString()} kWh</p>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Monthly Goal</p>
              <p className="text-3xl font-bold text-blue-400">{monthlyGoal.toLocaleString()} kWh</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-slate-400">Progress</p>
                <p className="text-sm font-semibold text-slate-200">{Math.round(goalProgress)}%</p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                ></div>
              </div>
            </div>

            {goalProgress < 100 ? (
              <p className="text-emerald-400 text-sm mb-6">
                ✓ On track! {Math.round(monthlyGoal - currentUsage).toLocaleString()} kWh remaining
              </p>
            ) : (
              <p className="text-red-400 text-sm mb-6">
                ⚠ Goal exceeded by {Math.round(currentUsage - monthlyGoal).toLocaleString()} kWh
              </p>
            )}

            {isEditingGoal ? (
              <div className="space-y-3">
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGoal}
                    disabled={goalLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    {goalLoading ? 'Saving...' : 'Save Goal'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingGoal(false);
                      setNewGoal(monthlyGoal);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Edit Goal
              </button>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">
              <Trophy size={24} className="text-yellow-400" />
              Achievements
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                <div className="text-2xl">🌟</div>
                <div>
                  <p className="font-semibold text-slate-100">Energy Saver</p>
                  <p className="text-sm text-slate-400">Reduced usage by 15%</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="font-semibold text-slate-100">Heating Expert</p>
                  <p className="text-sm text-slate-400">Optimized HVAC system</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl opacity-50">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="font-semibold text-slate-100">LED Champion</p>
                  <p className="text-sm text-slate-400">Switch all lights to LED</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl opacity-50">
                <div className="text-2xl">♻️</div>
                <div>
                  <p className="font-semibold text-slate-100">Eco Warrior</p>
                  <p className="text-sm text-slate-400">Reduce carbon footprint</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Saving Tips */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-100">
          <Lightbulb size={28} className="text-yellow-400" />
          Energy-Saving Tips ({energyTips.length})
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {energyTips.map((tip) => (
            <div
              key={tip.id}
              className="bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:bg-slate-700/50 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{tip.icon}</div>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  Save {tip.savings}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-2 text-slate-100 group-hover:text-blue-400 transition-colors">
                {tip.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{tip.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <span className="text-xs text-slate-500 uppercase">{tip.category}</span>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
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
