import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CatLottie } from './CatLottie';
import clsx from 'classnames';

export type ToastType = 'info' | 'loading' | 'success' | 'love' | 'error' | 'hint';

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastContextType = {
  push: (toast: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isDesktop, setDesktop] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => setDesktop(window.innerWidth >= 900);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const push = (toast: Omit<ToastItem, 'id'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    const duration = toast.duration ?? (toast.type === 'loading' ? 5000 : 2800);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const providerValue = useMemo(() => ({ push }), []);

  const positionStyle = isDesktop
    ? { top: 18, right: 18, left: 'auto' as const }
    : { bottom: 82, left: 12, right: 12 };

  return (
    <ToastContext.Provider value={providerValue}>
      {children}
      <div className={clsx('toast-stack', isDesktop && 'desktop')} style={positionStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {toasts.map(toast => (
            <div key={toast.id} className="toast-item">
              <CatLottie
                variant={
                  toast.type === 'success'
                    ? 'successCheck'
                    : toast.type === 'love'
                      ? 'successLove'
                      : toast.type === 'error'
                        ? 'error'
                        : toast.type === 'loading'
                          ? 'loading'
                          : 'hint'
                }
                size="sm"
                autoplay
                loop={toast.type === 'loading'}
              />
              <div className="text">
                <strong>{toast.title}</strong>
                {toast.message && <span className="muted">{toast.message}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus di dalam ToastProvider');
  return ctx;
}
