import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/8 rounded-2xl shadow-sm ${hover ? 'hover:border-slate-300 dark:hover:border-white/14 hover:shadow-md transition-all hover:-translate-y-0.5' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/6 flex items-center justify-center">
            <span className="text-slate-500 dark:text-slate-400">{icon}</span>
          </div>
        )}
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      {action}
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1629] p-12 sm:p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center mx-auto mb-4">
        <span className="text-slate-400">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{message}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}
