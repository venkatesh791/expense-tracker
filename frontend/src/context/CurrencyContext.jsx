import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

const currencyMap = {
  INR: { symbol: '₹', locale: 'en-IN' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
};

export const CurrencyProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('currency') || 'INR';
  });

  // Sync with auth user setting when logged in
  useEffect(() => {
    if (user?.currency) {
      setCurrencyState(user.currency);
    }
  }, [user]);

  const changeCurrency = async (newCurrency) => {
    if (!currencyMap[newCurrency]) return;
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);

    // If logged in, save to backend
    if (user) {
      try {
        await updateProfile({ currency: newCurrency });
      } catch (err) {
        console.error('Failed to sync currency preference with backend', err);
      }
    }
  };

  const format = (value) => {
    const config = currencyMap[currency] || currencyMap.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getSymbol = () => {
    return currencyMap[currency]?.symbol || '₹';
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: getSymbol(),
        changeCurrency,
        format,
        currencies: Object.keys(currencyMap),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
export default CurrencyContext;
