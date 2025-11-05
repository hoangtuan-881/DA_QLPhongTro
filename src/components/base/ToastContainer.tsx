
import { useState, useCallback } from 'react';
import Toast, { type ToastProps } from './Toast';

export interface ToastData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let toastId = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toastData: ToastData) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastProps = {
      id,
      ...toastData,
      onClose: removeToast,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast globally
  (window as any).showToast = addToast;

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${index * 80}px` }}
          className="relative"
        >
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
