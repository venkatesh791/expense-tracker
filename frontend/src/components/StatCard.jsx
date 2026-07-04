import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, trendType, loading }) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder shimmer h-32 flex flex-col justify-between">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  const getTrendColor = () => {
    if (trendType === 'positive') return 'text-success bg-success/10';
    if (trendType === 'negative') return 'text-danger bg-danger/10';
    return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-darkCard p-6 border border-slate-200 dark:border-darkBorder transition-colors relative overflow-hidden group fade-in">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-primary dark:text-primary-light group-hover:scale-110 transition-transform duration-300">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center space-x-2">
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTrendColor()}`}>
            {trend}
          </span>
        )}
        {description && (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
