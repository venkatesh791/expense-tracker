import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Check, Palette, Sparkles, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [saveStatus, setSaveStatus] = useState('');
  const [passStatus, setPassStatus] = useState('');
  const [error, setError] = useState('');

  // Preset avatar choices
  const avatarSeeds = ['Abhishek', 'Vikram', 'Arya', 'Venkat', 'Ananya', 'Pooja'];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name) return;

    setSaveStatus('saving');
    setError('');
    try {
      await updateProfile({ name, profileImage });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
      setSaveStatus('error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setPassStatus('saving');
    setError('');
    try {
      await updateProfile({ password: newPassword });
      setPassStatus('success');
      setTimeout(() => setPassStatus(''), 2000);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
      setPassStatus('error');
    }
  };

  const selectAvatarSeed = (seed) => {
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setProfileImage(avatarUrl);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div>
        <h3 className="text-xl font-bold tracking-tight">Account Settings</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Manage preferences and profile details</p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger text-xs font-semibold rounded-2xl border border-danger/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card & Avatar picker */}
        <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass flex flex-col items-center justify-between h-fit text-center">
          <div className="w-full flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-darkBorder bg-slate-100 object-cover"
              />
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md">
                <Sparkles size={14} />
              </div>
            </div>

            <h4 className="font-extrabold text-lg tracking-tight">{user?.name}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-6">{user?.email}</p>

            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
              Quick Avatars
            </span>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {avatarSeeds.map((seed) => (
                <button
                  key={seed}
                  onClick={() => selectAvatarSeed(seed)}
                  className="w-10 h-10 rounded-full border border-slate-100 dark:border-darkBorder bg-slate-50 dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`}
                    alt={seed}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-darkBorder mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Finance Account Active
          </div>
        </div>

        {/* Configurations Forms (2/3 columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* General Profile fields */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass">
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6 flex items-center gap-1.5">
              <User size={16} className="text-primary" />
              Personal Details
            </h4>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Profile Avatar URL
                </label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-xs text-slate-400 dark:text-slate-500 font-mono"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="py-3 px-5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                >
                  {saveStatus === 'saving' ? 'Saving Details...' : 'Save Profile Changes'}
                </button>
                {saveStatus === 'success' && (
                  <span className="text-xs text-success font-bold flex items-center gap-1 mt-2">
                    <Check size={14} /> Profile details updated
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Preferences Settings (theme & currency) */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass">
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6 flex items-center gap-1.5">
              <Palette size={16} className="text-primary" />
              Workspace Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                  Theme Appearance
                </span>
                <button
                  onClick={toggleTheme}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left flex justify-between items-center"
                >
                  <span>Select Color Scheme</span>
                  <span className="text-primary uppercase">{theme} Mode</span>
                </button>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                  Base Currency formatting
                </span>
                <select
                  value={currency}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-xs font-bold"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                  <option value="EUR">EUR (€ European Euro)</option>
                  <option value="GBP">GBP (£ Great British Pound)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security details (Password change) */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass">
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6 flex items-center gap-1.5">
              <KeyRound size={16} className="text-primary" />
              Change Security Password
            </h4>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  New Secret Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passStatus === 'saving'}
                  className="py-3 px-5 bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition-all flex items-center gap-1.5"
                >
                  {passStatus === 'saving' ? 'Updating Password...' : 'Update Password'}
                </button>
                {passStatus === 'success' && (
                  <span className="text-xs text-success font-bold flex items-center gap-1 mt-2">
                    <Check size={14} /> Password updated successfully
                  </span>
                )}
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
