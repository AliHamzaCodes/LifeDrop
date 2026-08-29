import { createContext, useContext, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import './ToastContext.scss';

const ToastContext = createContext<any>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState<any[]>([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 2000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return faCircleCheck;
      case 'error':
        return faCircleXmark;
      case 'warning':
        return faTriangleExclamation;
      case 'info':
      default:
        return faCircleInfo;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, dismissToast }}>
      {children}
      <div className="toast-container" role="log" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="alert">
            <span className="toast__icon">
              <FontAwesomeIcon icon={getIcon(t.type)} />
            </span>
            <span className="toast__message">{t.message}</span>
            <button
              className="toast__close"
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Close notification"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

