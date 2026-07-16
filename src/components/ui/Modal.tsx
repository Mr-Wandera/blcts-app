import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxW = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, subtitle, icon, children, footer, maxWidth = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm dark:bg-black/70 animate-fade-in" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxW[maxWidth]} bg-white dark:bg-[#0f1629] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/12 animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8 sticky top-0 bg-white dark:bg-[#0f1629] z-10">
          <div className="flex items-center gap-2.5">
            {icon && <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">{icon}</div>}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-[#0f1629] sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
