// hooks/use-toast.tsx
import { useCallback, useState } from 'react';

// Mise à jour du type pour inclure 'destructive'
type ToastType = 'default' | 'success' | 'error' | 'info' | 'destructive';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    setToasts(prev => [...prev, options]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast !== options));
    }, options.duration || 3000);
  }, []);

  return { toast, toasts };
}

// Version standalone de toast
export const toast = (options: ToastOptions) => {
  const message = `${options.title ? options.title + ': ' : ''}${options.description}`;
  
  switch (options.variant) {
    case 'destructive':
    case 'error':
      console.error(message);
      break;
    case 'success':
      console.log(message);
      break;
    default:
      console.info(message);
  }
};

// Export des types pour une utilisation ailleurs
export type { ToastType, ToastOptions };