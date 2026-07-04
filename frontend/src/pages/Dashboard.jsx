import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import StatCard from '../components/StatCard';
import OnboardingModal from '../components/OnboardingModal';
import api from '../utils/api';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  ChevronRight,
  Plus,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

const Dashboard = ({ setActivePage }) => {
  const { user } = useAuth();
  const { format, symbol } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlySavings: 0,
    budgetLimit: 0,
    budgetUtilization: 0,
    recentTransactions: [],
  });
  const [insights, setInsights] = useState([]);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats and insights
      const [summaryRes, insightsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/insights'),
      ]);
      setData(summaryRes.data);
      setInsights(insightsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Trigger onboarding check
    const onboarded = localStorage.getItem(`onboarded_${user?._id || 'guest'}`);
    if (!onboarded) {
      setOnboardingOpen(true);
    }
  }, [user]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-success" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-warning" size={18} />;
      default:
        return <Info className="text-primary" size={18} />;
    }
  };

  const getInsightClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-success/20 bg-success/5 text-success-dark dark:text-success-light';
      case 'warning':
        return 'border-warning/20 bg-warning/5 text-warning-dark dark:text-warning-light';
      default:
        return 'border-primary/20 bg-primary/5 text-primary-dark dark:text-primary-light';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Onboarding trigger */}
      <OnboardingModal isOpen={onboardingOpen} onClose={() => { setOnboardingOpen(false); fetchData(); }} />

      {/* Main Widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={format(data.totalBalance)}
          icon={Wallet}
          description="Cumulative net savings"
          loading={loading}
        />
        <StatCard
          title="Monthly Income"
          value={format(data.totalIncome)}
          icon={TrendingUp}
          description="Total credited this month"
          trendType="positive"
          loading={loading}
        />
        <StatCard
          title="Monthly Expenses"
          value={format(data.totalExpenses)}
          icon={TrendingDown}
          description="Total spent this month"
          trendType={data.totalExpenses > data.budgetLimit ? 'negative' : 'neutral'}
          loading={loading}
        />
        <StatCard
          title="Savings Rate"
          value={data.totalIncome > 0 ? `${Math.round(((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100)}%` : '0%'}
          icon={Percent}
          description={`Savings: ${format(data.monthlySavings)}`}
          trendType="positive"
          loading={loading}
        />
      </div>

      {/* Budget Gauges & Core Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Budget utilization widget */}
        <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-display font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Monthly Budget Gauge
              </h4>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold">
                <Calendar size={14} />
                This Month
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-extrabold tracking-tight">
                  {Math.round(data.budgetUtilization)}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                  {format(data.totalExpenses)} / {data.budgetLimit > 0 ? format(data.budgetLimit) : 'No Budget Set'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    data.budgetUtilization >= 100
                      ? 'bg-danger'
                      : data.budgetUtilization >= 80
                      ? 'bg-warning'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, data.budgetUtilization)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-medium pt-1">
                <span>Used: {format(data.totalExpenses)}</span>
                <span>Remaining: {format(Math.max(0, data.budgetLimit - data.totalExpenses))}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-darkBorder mt-6 flex justify-between">
            <button
              onClick={() => setActivePage('budgets')}
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center"
            >
              <span>Manage Budgets</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setActivePage('expenses')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <Plus size={14} />
              Add Expense
            </button>
          </div>
        </div>

        {/* AI smart Insights (middle widget) */}
        <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-display font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Zap size={16} className="text-warning fill-warning/20" />
                Smart AI Insights
              </h4>
            </div>

            <div className="space-y-4">
              {loading ? (
                [1, 2].map(i => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 shimmer" />
                ))
              ) : insights.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-400 dark:text-slate-500 font-semibold">
                  Generate insights by adding expenses and budgets.
                </div>
              ) : (
                insights.slice(0, 3).map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${getInsightClass(insight.type)}`}
                  >
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div>
                      <strong className="block font-bold text-slate-800 dark:text-white mb-0.5">{insight.title}</strong>
                      <span dangerouslySetInnerHTML={{ __html: insight.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-darkBorder mt-6">
            <button
              onClick={() => setActivePage('analytics')}
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center"
            >
              <span>Explore Analytics Trends</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Recent Transactions List */}
      <div className="rounded-3xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-display font-extrabold text-sm uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Recent Transactions
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Your latest financial postings</p>
          </div>
          <button
            onClick={() => setActivePage('transactions')}
            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center"
          >
            <span>See All Transactions</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-darkBorder text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Type</th>
                <th className="py-3 px-4 font-bold">Method/Notes</th>
                <th className="py-3 px-4 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/60 text-sm">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="shimmer h-12">
                    <td colSpan="5"></td>
                  </tr>
                ))
              ) : data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    No transactions yet. Click below to add one!
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {tx.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tx.type === 'income'
                            ? 'text-success bg-success/10'
                            : 'text-danger bg-danger/10'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                      {tx.description || '-'}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-extrabold ${
                        tx.type === 'income' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {format(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
