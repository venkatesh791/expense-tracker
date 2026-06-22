import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Wallet } from 'lucide-react';

const Login = ({ onNavigateToRegister, onNavigateToForgot }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('demo@example.com', 'Password123');
    } catch (err) {
      setError('Failed to login with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-3xl p-8 border border-slate-200/50 dark:border-darkBorder/40 shadow-2xl glass fade-in">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-3">
            <Wallet size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Expense Tracker</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Track expenses, set budgets, analyze savings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 text-danger text-xs font-semibold rounded-2xl border border-danger/20">
            {error}
          </div>
        )}

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

          <div>
            <div className="flex justify-between items-center mb-2">
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
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold transition-colors"
                required
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
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-darkBorder"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Or</span>
          <div className="flex-grow border-t border-slate-200 dark:border-darkBorder"></div>
        </div>

        {/* Demo login button */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3.5 bg-success/10 hover:bg-success/20 text-success rounded-2xl font-bold border border-success/20 transition-all flex items-center justify-center space-x-2"
        >
          <span>Use Demo Account</span>
        </button>

        <div className="mt-8 text-center text-xs">
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
  );
};

export default Login;
