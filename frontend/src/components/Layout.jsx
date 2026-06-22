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
    // Redirect to login page or handle auth flow reset
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-darkCard border-r border-slate-200 dark:border-darkBorder shadow-sm z-20">
        {/* Brand */}
        <div className="p-6 border-b border-slate-200 dark:border-darkBorder flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Expense Tracker</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Finance Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : ''} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-darkBorder">
          <div className="flex items-center space-x-3 p-2 rounded-xl mb-2">
            <img
              src={user?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-darkBorder bg-slate-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || 'Guest User'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm text-danger hover:bg-danger/10 transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-darkCard border-b border-slate-200 dark:border-darkBorder shadow-sm z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-md tracking-tight">Expense Tracker</span>
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
            className="w-64 max-w-sm h-full bg-white dark:bg-darkCard flex flex-col p-4 shadow-2xl animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-darkBorder">
              <span className="font-extrabold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm ${
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

            <div className="border-t border-slate-100 dark:border-darkBorder pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm text-danger hover:bg-danger/10"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-darkCard border-b border-slate-200 dark:border-darkBorder">
          <div>
            <h2 className="text-xl font-bold capitalize tracking-tight">{activePage}</h2>
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
                className="w-8 h-8 rounded-full border border-slate-100 dark:border-darkBorder bg-slate-100 cursor-pointer"
                onClick={() => setActivePage('profile')}
              />
            </div>
          </div>
        </header>

        {/* Page Content area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
