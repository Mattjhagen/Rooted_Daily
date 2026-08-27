import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
  toast: ToastOptions | null;
  visible: boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    setToast({ message, type, duration });
    setVisible(true);

    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast, visible }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
