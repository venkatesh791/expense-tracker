import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

// Layout Shell
import Layout from './components/Layout';
import { RefreshCw } from 'lucide-react';

const MainAppContent = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register' | 'forgot'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw size={36} className="text-primary animate-spin" />
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Initializing Tracker...
          </h3>
        </div>
      </div>
    );
  }

  // Logged-in application flow
  if (user) {
    const renderPage = () => {
      switch (activePage) {
        case 'dashboard':
          return <Dashboard setActivePage={setActivePage} />;
        case 'incomes':
          return <Incomes />;
        case 'expenses':
          return <Expenses />;
        case 'budgets':
          return <Budgets />;
        case 'analytics':
          return <Analytics />;
        case 'transactions':
          return <Transactions />;
        case 'profile':
          return <Profile />;
        default:
          return <Dashboard setActivePage={setActivePage} />;
      }
    };

    return (
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderPage()}
      </Layout>
    );
  }

  // Anonymous authentication flow
  switch (authPage) {
    case 'login':
      return (
        <Login
          onNavigateToRegister={() => setAuthPage('register')}
          onNavigateToForgot={() => setAuthPage('forgot')}
        />
      );
    case 'register':
      return <Register onNavigateToLogin={() => setAuthPage('login')} />;
    case 'forgot':
      return <ForgotPassword onNavigateToLogin={() => setAuthPage('login')} />;
    default:
      return (
        <Login
          onNavigateToRegister={() => setAuthPage('register')}
          onNavigateToForgot={() => setAuthPage('forgot')}
        />
      );
  }
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <MainAppContent />
        </CurrencyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
