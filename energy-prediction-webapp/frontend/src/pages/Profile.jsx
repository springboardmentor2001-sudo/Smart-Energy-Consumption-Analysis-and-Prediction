import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Calendar, Award } from 'lucide-react';
import { Toast } from '../components/Toast';

export const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSaveProfile = () => {
    if (!formData.name) {
      setToast({ type: 'error', message: 'Name cannot be empty' });
      return;
    }
    setToast({ type: 'success', message: 'Profile updated successfully!' });
    setTimeout(() => setIsEditing(false), 1500);
  };

  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setToast({ type: 'error', message: 'All password fields are required' });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setToast({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    setToast({ type: 'success', message: 'Password changed successfully!' });
    setFormData({...formData, currentPassword: '', newPassword: '', confirmPassword: ''});
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Profile</h1>
        <p className="text-slate-400">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-4">
            <User className="text-white" size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{user?.name || 'User'}</h2>
            <p className="text-slate-400">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 disabled:opacity-50"
            />
            <p className="text-xs text-slate-500 mt-2">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-xs text-slate-500 mb-1">Member Since</p>
              <p className="text-slate-200 flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                January 2026
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Account Status</p>
              <p className="text-slate-200 flex items-center gap-2">
                <Award size={16} className="text-emerald-400" />
                Active
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 px-4 rounded-lg transition-all mt-4"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Lock size={24} className="text-blue-400" />
          Change Password
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all mt-6"
          >
            Update Password
          </button>
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
