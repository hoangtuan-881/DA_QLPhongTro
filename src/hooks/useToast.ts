
import { useCallback } from 'react';

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', options: ToastOptions) => {
    if ((window as any).showToast) {
      (window as any).showToast({
        type,
        ...options,
      });
    }
  }, []);

  const success = useCallback((options: ToastOptions) => {
    showToast('success', options);
  }, [showToast]);

  const error = useCallback((options: ToastOptions) => {
    showToast('error', options);
  }, [showToast]);

  const warning = useCallback((options: ToastOptions) => {
    showToast('warning', options);
  }, [showToast]);

  const info = useCallback((options: ToastOptions) => {
    showToast('info', options);
  }, [showToast]);

  return {
    success,
    error,
    warning,
    info,
  };
}
