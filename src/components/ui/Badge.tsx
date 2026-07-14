interface Props {
  label: string;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'purple';
}

export function Badge({ label, color = 'slate' }: Props) {
  const colors = {
    green:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    blue: 'bg-blue-50 text-emerald-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40',
    amber:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40',
    slate:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#0f1629] dark:text-slate-400 dark:border-white/8',
    purple:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${colors[color]}`}
    >
      {label}
    </span>
  );
}
