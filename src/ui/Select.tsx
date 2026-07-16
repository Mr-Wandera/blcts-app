import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  id?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f1629] text-slate-900 dark:text-white text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer ${
            error
              ? 'border-rose-300 dark:border-rose-800/60 focus:ring-rose-500'
              : 'border-slate-200 dark:border-white/10'
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '36px',
          }}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
