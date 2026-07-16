import { type ReactNode } from 'react';

type KpiColor = 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'slate';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  color?: KpiColor;
}

const colorMap: Record<KpiColor, string> = {
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-white/6 dark:text-slate-400',
};

export function KpiCard({ label, value, icon, sub, trend, trendUp, color = 'emerald' }: KpiCardProps) {
  return (
    <div className="group bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/8 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/14 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>{trend}</span>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1">{value}</div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
