import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { z } from 'zod';
import api from '../utils/api';
import { Calendar, Save, Trash2, ShieldAlert, Sparkles, HelpCircle, Check } from 'lucide-react';

const budgetSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  limit: z.coerce.number().nonnegative('Limit must be greater than or equal to zero'),
  month: z.string().min(1, 'Please select a month'),
});

const Budgets = () => {
  const { format, symbol } = useCurrency();
  const { showToast } = useToast();
  
  // Default month YYYY-MM
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    summary: [],
    totalLimit: 0,
    totalSpent: 0,
    totalPercentUsed: 0,
  });

  // Settings state
  const [editCategory, setEditCategory] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const fetchBudgetSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets/summary', { params: { month } });
      setSummaryData(data);
    } catch (err) {
      console.error('Error fetching budget summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetSummary();
  }, [month]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const result = budgetSchema.safeParse({ category: editCategory, limit: editLimit, month });
    if (!result.success) {
      const errorMsg = result.error.errors?.[0]?.message || result.error.issues?.[0]?.message || 'Validation failed';
      showToast(errorMsg, 'error');
      return;
    }

    setSyncStatus('saving');
    try {
      await api.post('/budgets', {
        category: editCategory,
        limit: Number(editLimit),
        month,
      });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus(''), 2000);
      setEditCategory('');
      setEditLimit('');
      fetchBudgetSummary();
    } catch (err) {
      setSyncStatus('error');
      console.error('Error setting budget:', err);
    }
  };

  const handleDeleteBudget = async (category) => {
    const confirmMsg = category === 'Total'
      ? 'Are you sure you want to delete the overall monthly budget limit?'
      : `Are you sure you want to delete the budget limit for ${category}?`;

    if (window.confirm(confirmMsg)) {
      try {
        await api.delete('/budgets', { data: { category, month } });
        fetchBudgetSummary();
      } catch (err) {
        console.error('Error deleting budget:', err);
      }
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-danger';
    if (percent >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getProgressBg = (percent) => {
    if (percent >= 100) return 'bg-danger/10';
    if (percent >= 80) return 'bg-warning/10';
    return 'bg-success/10';
  };

  const categories = [
    'Total',
    'Food',
    'Travel',
    'Shopping',
    'Bills',
    'Entertainment',
    'Education',
    'Healthcare',
    'Other',
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Budget Planning</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Establish spending boundaries and track goals</p>
        </div>
        
        {/* Month Selector */}
        <div className="relative flex items-center self-start">
          <Calendar className="absolute left-3.5 text-slate-400 pointer-events-none" size={14} />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-xs font-bold focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Main Budget summary & quick edit tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Set Budget Form (1/3 column) */}
        <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder h-fit">
          <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6 flex items-center gap-1.5">
            <Sparkles size={16} className="text-primary" />
            Set Category Limits
          </h4>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                Target Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'Total' ? 'Overall Monthly Limit' : cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                Limit Amount ({symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{symbol}</span>
                <input
                  type="number"
                  placeholder="5000"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={syncStatus === 'saving'}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{syncStatus === 'saving' ? 'Saving Limit...' : 'Save Limit'}</span>
            </button>
            
            {syncStatus === 'success' && (
              <p className="text-center text-xs text-success font-bold flex items-center justify-center gap-1 mt-2">
                <Check size={14} /> Limit updated successfully
              </p>
            )}
          </form>
        </div>

        {/* Categories budget progress list (2/3 columns) */}
        <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder lg:col-span-2 space-y-6">
          <div>
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Budget Spending Tracker
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Your spending against budget boundaries</p>
          </div>

          <div className="space-y-5">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded shimmer"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded shimmer"></div>
                </div>
              ))
            ) : summaryData.summary.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500 font-semibold border border-dashed border-slate-200 dark:border-darkBorder rounded-2xl p-6">
                No active budget limits configured for this month. 
                Use the left tool to set limits!
              </div>
            ) : (
              // Order Total first if it exists
              [...summaryData.summary]
                .sort((a, b) => (a.category === 'Total' ? -1 : b.category === 'Total' ? 1 : 0))
                .map((b) => (
                  <div
                    key={b.category}
                    className={`p-4 rounded-2xl border transition-all ${
                      b.percentUsed >= 100
                        ? 'border-danger/20 dark:border-danger/10 bg-danger/5'
                        : b.percentUsed >= 80
                        ? 'border-warning/20 dark:border-warning/10 bg-warning/5'
                        : 'border-slate-100 dark:border-darkBorder/50'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                          {b.category === 'Total' ? 'Overall Monthly Budget' : b.category}
                        </span>
                        {b.percentUsed >= 80 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            b.percentUsed >= 100 ? 'text-danger bg-danger/10' : 'text-warning bg-warning/10'
                          }`}>
                            {b.percentUsed >= 100 ? 'Exceeded' : 'Near Limit'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-500">
                          {format(b.spent)} / {format(b.limit)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBudget(b.category)}
                          className="p-1 text-slate-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
                          title="Delete budget limit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getProgressColor(b.percentUsed)}`}
                        style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <span>{Math.round(b.percentUsed)}% Used</span>
                      <span className={b.remaining < 0 ? 'text-danger font-extrabold' : 'font-semibold'}>
                        {b.remaining < 0 ? `Overspend: ${format(Math.abs(b.remaining))}` : `Remaining: ${format(b.remaining)}`}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Budgets;
