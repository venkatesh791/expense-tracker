import React, { useState } from 'react';
import api from '../utils/api';
import { ArrowLeft, Mail, RefreshCw, AlertCircle } from 'lucide-react';

const ForgotPassword = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [recoveryLink, setRecoveryLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      setMessage(data.message);
      setOtp(data.otp);
      setRecoveryLink(data.recoveryLink);
    } catch (err) {
      setError(err.response?.data?.message || 'Email address not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-3xl p-8 border border-slate-200/50 dark:border-darkBorder/40 shadow-2xl glass fade-in">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onNavigateToLogin}
            className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-3">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-center">Reset Password</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 text-center leading-relaxed">
            Enter your email and we'll send a simulated recovery verification setup.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 text-danger text-xs font-semibold rounded-2xl border border-danger/20">
            {error}
          </div>
        )}

        {message ? (
          <div className="space-y-6 fade-in">
            <div className="p-4 bg-success/10 text-success text-xs font-bold rounded-2xl border border-success/20 leading-relaxed">
              {message}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-darkBorder rounded-2xl p-5 space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                  Simulated OTP Code
                </span>
                <span className="text-2xl font-extrabold tracking-widest text-primary">
                  {otp}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                  Simulated Recovery Link
                </span>
                <a
                  href={recoveryLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary font-semibold hover:underline break-all block"
                >
                  {recoveryLink}
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setMessage('');
                setEmail('');
              }}
              className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Request Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Send Recovery Instructions</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
