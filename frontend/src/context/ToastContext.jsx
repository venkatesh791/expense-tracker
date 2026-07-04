import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

// Global callback for triggering toasts from non-React modules (like Axios interceptors)
let externalToastTrigger = null;

export const triggerExternalToast = (message, type) => {
  if (externalToastTrigger) {
    externalToastTrigger(message, type);
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Register external trigger on mount
  useEffect(() => {
    externalToastTrigger = showToast;
    return () => {
      externalToastTrigger = null;
    };
  }, []);

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success text-white border-success-dark',
          icon: <CheckCircle size={18} className="text-white flex-shrink-0" />,
        };
      case 'info':
        return {
          bg: 'bg-primary text-white border-primary-dark',
          icon: <Info size={18} className="text-white flex-shrink-0" />,
        };
      case 'error':
      default:
        return {
          bg: 'bg-danger text-white border-danger-dark',
          icon: <AlertCircle size={18} className="text-white flex-shrink-0" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        {toasts.map((toast) => {
          const { bg, icon } = getToastStyle(toast.type);
          return (
            <ToastItem
              key={toast.id}
              toast={toast}
              bg={bg}
              icon={icon}
              onRemove={removeToast}
            />
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// Sub-component to manage automatic timer per Toast item
const ToastItem = ({ toast, bg, icon, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl flex items-start gap-3 border text-sm font-semibold animate-fadeIn ${bg}`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 break-words">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/80 hover:text-white transition-colors focus:outline-none self-start mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => useContext(ToastContext);
