import React, { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { z } from 'zod';
import { ArrowLeft, Mail, RefreshCw, AlertCircle, Wallet, CheckCircle, Sparkles, LineChart, Zap } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Email address is required' }).email({ message: 'Invalid email address' }),
});

const ForgotPassword = ({ onNavigateToLogin }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [recoveryLink, setRecoveryLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Zod validation
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const errorMsg = result.error.errors?.[0]?.message || result.error.issues?.[0]?.message || 'Validation failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return;
    }

    setLoading(true);
    try {
      // NOTE: Fixed duplicate /api routing prefix bug. Called /auth/forgot-password instead of /api/auth/forgot-password
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setOtp(data.otp);
      setRecoveryLink(data.recoveryLink);
      showToast('Recovery instructions retrieved successfully!', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Email address not found';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Left side: Value of the app (Desktop only) */}
      <div className="hidden md:flex md:w-3/5 bg-gradient-to-tr from-[#022c22] via-[#0f172a] to-[#0f766e] text-slate-100 p-16 flex-col justify-between relative overflow-hidden">
        {/* SVG Noise/Grain Overlay */}
        <svg className="absolute inset-0 w-full h-full object-cover opacity-[0.16] pointer-events-none mix-blend-overlay" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Wallet size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Expense Tracker</span>
          </div>

          <div className="space-y-6 max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-200">
              Personal Workspace Platform
            </span>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Finance that moves <br />
              at the <span className="underline decoration-[#0d9488] decoration-wavy decoration-2 underline-offset-4">speed of life</span>.
            </h1>
            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-md">
              Track transaction pipelines, coordinate category budgets, and optimize savings in a glass-morphic visual workspace.
            </p>
          </div>
        </div>

        {/* Bottom Cards: Horizontal list */}
        <div className="relative z-10 flex gap-4 mt-12">
          {/* Card 1 */}
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-primary-light flex-shrink-0">
              <LineChart size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Visual Tracker</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Cash flow charts representing details.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-warning-light flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Smart Limits</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Configure category boundaries easily.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-success-light flex-shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">AI Insights</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Automated tips and alerts generated.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Forgot Password Form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8 bg-white dark:bg-darkCard transition-colors">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={onNavigateToLogin}
              className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </button>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-2 md:hidden">
              <Wallet size={24} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Reset Password</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Simulated credential recovery tool
            </p>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 text-danger text-xs font-semibold rounded-xl border border-danger/20 flex items-start space-x-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message ? (
            <div className="space-y-6">
              <div className="p-4 bg-success/10 text-success text-xs font-bold rounded-xl border border-success/20 leading-relaxed">
                {message}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-darkBorder rounded-xl p-5 space-y-4">
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
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-darkBorder transition-colors text-sm"
              >
                Request Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center space-x-2"
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
    </div>
  );
};

export default ForgotPassword;
