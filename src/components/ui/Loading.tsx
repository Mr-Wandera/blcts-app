export function Loading({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-10 h-10 border-3 border-emerald-200 dark:border-emerald-900/40 border-t-emerald-600 rounded-full animate-spin mb-4" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
