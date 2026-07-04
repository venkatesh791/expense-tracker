import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { z } from 'zod';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Wallet, CheckCircle, ShieldAlert, Sparkles, LineChart } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email address is required' }).email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const Login = ({ onNavigateToRegister, onNavigateToForgot }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Zod validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errorMsg = result.error.errors?.[0]?.message || result.error.issues?.[0]?.message || 'Validation failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('demo@example.com', 'Password123');
      showToast('Welcome to Demo Workspace!', 'success');
    } catch (err) {
      const errorMsg = 'Failed to login with demo account.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Left side: Value of the app (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-slate-100 p-16 flex-col justify-between border-r border-slate-800">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Wallet size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Expense Tracker</span>
          </div>

          <div className="space-y-8 max-w-lg mt-12">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Take complete control of your financial workspace.
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Ditch the spreadsheets. Track your cash flow, design category budgets, and optimize your monthly savings in a solid, minimal dashboard.
            </p>

            <div className="space-y-4 pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle size={18} className="text-success mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Comprehensive Tracking</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Quickly document incomes and expenses in any major currency.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <LineChart size={18} className="text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Solid Analytics Insights</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Evaluate monthly cash distribution with flat, high-contrast trend charts.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Sparkles size={18} className="text-warning mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Category Spending Boundaries</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Define category limit gauges and receive real-time warnings when thresholds are hit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          © 2026 Expense Tracker. Security and Privacy First.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-darkCard transition-colors">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center md:items-start space-y-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-2 md:hidden">
              <Wallet size={24} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Enter credentials to access workspace
            </p>
          </div>

          {error && (
            <div className="p-4 bg-danger/10 text-danger text-xs font-semibold rounded-xl border border-danger/20 flex items-start space-x-2">
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-darkBorder"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-darkBorder"></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold border border-slate-200 dark:border-darkBorder transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Use Demo Account</span>
          </button>

          <div className="pt-4 text-center text-xs border-t border-slate-100 dark:border-darkBorder">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Don't have an account? </span>
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-primary hover:text-primary-dark transition-colors"
            >
              Sign Up Free
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
