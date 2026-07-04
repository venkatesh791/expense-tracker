import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose }) => {
  const { currencies, changeCurrency } = useCurrency();
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChooseCurrency = async () => {
    setLoading(true);
    try {
      // 1. Save currency to context/localStorage and database
      await changeCurrency(selectedCurrency);

      // 2. Mark user as onboarded in local storage
      localStorage.setItem(`onboarded_${user?._id || 'guest'}`, 'true');

      // 3. Dismiss onboarding modal
      onClose();
    } catch (err) {
      console.error('Error completing currency onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-darkCard rounded-3xl p-8 border border-slate-200 dark:border-darkBorder relative animate-scaleIn">
        
        <div className="fade-in">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight mb-2">Welcome to Expense Tracker!</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">
            Let's customize your tracking workspace. What is your preferred base currency? All transactions and widgets will show in this format.
          </p>
 
          <div className="grid grid-cols-2 gap-3 mb-8">
            {currencies.map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setSelectedCurrency(curr)}
                className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex justify-between items-center ${
                  selectedCurrency === curr
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 dark:border-darkBorder hover:border-slate-300 dark:hover:border-darkBorder/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{curr}</span>
                <span className="text-xs opacity-75">
                  {curr === 'INR' ? '₹ (Rupee)' : curr === 'USD' ? '$ (Dollar)' : curr === 'EUR' ? '€ (Euro)' : '£ (Pound)'}
                </span>
              </button>
            ))}
          </div>
 
          <button
            onClick={handleChooseCurrency}
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Saving Preference...' : 'Choose Currency'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
