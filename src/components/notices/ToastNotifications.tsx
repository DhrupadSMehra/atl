import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id:      number;
  message: string;
  variant: ToastVariant;
}

const IconSuccess = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconError = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const IconInfo = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <IconSuccess />,
  error:   <IconError />,
  info:    <IconInfo />,
};

interface ToastStackProps {
  toasts:    Toast[];
  onDismiss: (id: number) => void;
}

const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => (
  <div className="nb-toast-stack" role="region" aria-label="Notifications">
    <AnimatePresence initial={false}>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          layout
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{    opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`nb-toast ${t.variant}`}
          role="alert"
          aria-live="polite"
          onClick={() => onDismiss(t.id)}
          title="Dismiss notification"
        >
          <span className="nb-toast-icon">{ICONS[t.variant]}</span>
          <span className="nb-toast-msg">{t.message}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

let _nextId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', durationMs = 3500) => {
    const id = ++_nextId;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => dismiss(id), durationMs);
  }, [dismiss]);

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error:   (msg: string) => addToast(msg, 'error'),
    info:    (msg: string) => addToast(msg, 'info'),
  };

  return { toasts, dismiss, toast };
}

export default ToastStack;
