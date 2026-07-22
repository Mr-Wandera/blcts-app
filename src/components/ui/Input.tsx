import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// ─── Input ─────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

const baseField = 'w-full rounded-xl border bg-slate-50 dark:bg-white/4 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed';

export function Input({ label, error, hint, icon, className = '', ...rest }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          {...rest}
          className={`${baseField} ${error ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-200 dark:border-white/12'} ${icon ? 'pl-9' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Select ─────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...rest }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <select
        {...rest}
        className={`${baseField} ${error ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-200 dark:border-white/12'} ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Textarea ───────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', ...rest }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <textarea
        {...rest}
        className={`${baseField} resize-none ${error ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-200 dark:border-white/12'} ${className}`}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
