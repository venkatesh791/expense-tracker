import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Calendar, Filter, DollarSign, ArrowDownRight, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const { format, symbol } = useCurrency();
  const [range, setRange] = useState('monthly'); // weekly, monthly, quarterly, yearly
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    categoryData: [],
    monthlyTrend: [],
    topCategories: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/dashboard/analytics', { params: { range } });
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  // Color palette for Pie Chart & Bars
  const COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#14B8A6', '#F97316', '#6B7280'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-darkCard p-3 border border-slate-200 dark:border-darkBorder rounded-xl shadow-lg text-xs font-semibold glass">
          <p className="mb-1 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="flex justify-between items-center gap-4 py-0.5">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-extrabold">{format(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getActiveFilterClass = (currentRange) => {
    return range === currentRange
      ? 'bg-primary text-white shadow-md shadow-primary/20'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200';
  };

  const hasTrendData = analyticsData.monthlyTrend && analyticsData.monthlyTrend.some(item => item.income > 0 || item.expense > 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top filter action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Analytics & Reports</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Visual charts representing financial health</p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder/40 rounded-2xl p-1 shadow-sm self-start">
          {['weekly', 'monthly', 'quarterly', 'yearly'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRange(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${getActiveFilterClass(filter)}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-white dark:bg-darkCard rounded-3xl shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Income vs Expense comparison (Bar) */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass">
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6">
              Income vs Expense Comparison
            </h4>
            <div className="h-72 flex items-center justify-center">
              {!hasTrendData ? (
                <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">No transaction history found for this range.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} style={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Category Pie Chart */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass">
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6">
              Category Expenses Distribution
            </h4>
            <div className="h-72 flex flex-col sm:flex-row items-center justify-center">
              {analyticsData.categoryData.length === 0 ? (
                <div className="text-xs text-slate-400 font-bold uppercase">No category logs recorded.</div>
              ) : (
                <>
                  <div className="w-full sm:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {analyticsData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom legend */}
                  <div className="w-full sm:w-1/2 overflow-y-auto max-h-56 mt-4 sm:mt-0 px-4 space-y-2.5">
                    {analyticsData.categoryData.map((entry, index) => (
                      <div key={entry.name} className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-slate-600 dark:text-slate-300 font-bold">{entry.name}</span>
                        </div>
                        <span className="font-extrabold">{format(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chart 3: Savings Trend (Area) */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass">
            <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6">
              Monthly Savings Trend
            </h4>
            <div className="h-72 flex items-center justify-center">
              {!hasTrendData ? (
                <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">No savings history recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="savings" name="Net Savings" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Widget 4: Top Spending Categories ranker */}
          <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200/50 dark:border-darkBorder/40 shadow-sm glass flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-6">
                Top Spending Categories
              </h4>
              <div className="space-y-4">
                {analyticsData.topCategories.length === 0 ? (
                  <div className="text-xs text-slate-400 font-bold uppercase py-12 text-center">No transactions logged.</div>
                ) : (
                  analyticsData.topCategories.slice(0, 5).map((item, idx) => {
                    const totalSpendSum = analyticsData.topCategories.reduce((sum, c) => sum + c.amount, 0);
                    const percentage = Math.round((item.amount / (totalSpendSum || 1)) * 100);
                    
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between items-baseline text-xs font-semibold">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {idx + 1}. {item.category}
                          </span>
                          <span className="font-extrabold text-slate-800 dark:text-white">
                            {format(item.amount)} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 dark:border-darkBorder mt-6 flex justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <TrendingUp size={14} className="text-success" />
                Aggregated values
              </span>
              <span>Based on selected date-range</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
