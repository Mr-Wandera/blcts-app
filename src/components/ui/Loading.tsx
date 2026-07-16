import { Loader as Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = 'Loading…', className = '' }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-24 gap-3 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export function InlineLoading({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      {message}
    </div>
  );
}
