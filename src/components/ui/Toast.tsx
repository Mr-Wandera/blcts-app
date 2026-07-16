import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Check, TriangleAlert as AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: <Check className="w-4 h-4 text-emerald-400" />,
  error: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 shadow-xl text-sm font-medium animate-slide-up"
          >
            {icons[t.type]}
            {t.message}
            <button onClick={() => dismiss(t.id)} className="ml-2 text-slate-400 hover:text-white transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
