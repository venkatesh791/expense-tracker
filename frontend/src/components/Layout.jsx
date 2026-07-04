import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import NotificationBell from './NotificationBell';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  ListCollapse,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

const Layout = ({ children, activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'incomes', name: 'Incomes', icon: TrendingUp },
    { id: 'expenses', name: 'Expenses', icon: TrendingDown },
    { id: 'budgets', name: 'Budgets', icon: Wallet },
    { id: 'analytics', name: 'Analytics', icon: PieChart },
    { id: 'transactions', name: 'Transactions', icon: ListCollapse },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Desktop Sidebar (Fixed and non-scrolling except navigation list) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-darkCard border-r border-slate-200 dark:border-darkBorder z-20 h-full flex-shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 dark:border-darkBorder flex items-center space-x-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="font-display font-black text-sm tracking-tight text-slate-800 dark:text-white">Expense</span>
              <span className="font-display font-medium text-sm tracking-normal text-primary ml-1">Tracker</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Workspace</p>
          </div>
        </div>

        {/* Navigation list (Scrollable if there are many items) */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout - Sticky at bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard flex-shrink-0 mt-auto">
          <div className="flex items-center space-x-3 p-2 rounded-xl mb-2 border border-slate-100 dark:border-darkBorder bg-slate-50 dark:bg-slate-800/40">
            <img
              src={user?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
              alt="Profile"
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-darkBorder bg-slate-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm text-danger hover:bg-danger/10 border border-transparent hover:border-danger/25 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-darkCard border-b border-slate-200 dark:border-darkBorder z-30 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm">
            <Wallet size={16} className="text-white" />
          </div>
          <div className="flex items-baseline">
            <span className="font-display font-black text-sm tracking-tight text-slate-800 dark:text-white">Expense</span>
            <span className="font-display font-medium text-sm tracking-normal text-primary ml-1">Tracker</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-500 dark:text-slate-400 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-64 max-w-sm h-full bg-white dark:bg-darkCard flex flex-col p-4 border-r border-slate-200 dark:border-darkBorder"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-darkBorder">
              <span className="font-display font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 dark:border-darkBorder pt-4 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm text-danger hover:bg-danger/10 border border-transparent hover:border-danger/25 transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-darkCard border-b border-slate-200 dark:border-darkBorder flex-shrink-0">
          <div>
            <h2 className="font-display text-xl font-bold capitalize tracking-tight">{activePage}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Welcome back, {user?.name || 'User'}! Keep tracking your financial goals.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={18} className="text-warning" /> : <Moon size={18} className="text-primary" />}
            </button>

            {/* Notification bell dropdown */}
            <NotificationBell />

            {/* User Profile avatar */}
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-darkBorder pl-4">
              <img
                src={user?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-darkBorder bg-slate-100 cursor-pointer hover:border-primary transition-all"
                onClick={() => setActivePage('profile')}
              />
            </div>
          </div>
        </header>

        {/* Page Content area (Scrolls independently) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
