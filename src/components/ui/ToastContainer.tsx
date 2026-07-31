'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeToToasts, ToastOptions } from '@/lib/toast';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import styles from './ToastContainer.module.css';

interface ToastItem extends ToastOptions {
  id: string;
  removing?: boolean;
}

const ICONS = {
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  useEffect(() => {
    return subscribeToToasts((t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => remove(t.id), t.duration ?? 4000);
    });
  }, [remove]);

  if (!toasts.length) return null;

  return (
    <div className={styles.container} role="region" aria-label="Notifications">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type ?? 'info']} ${t.removing ? styles.removing : ''}`}
          role="alert"
        >
          <span className={styles.icon}>{ICONS[t.type ?? 'info']}</span>
          <div className={styles.body}>
            <p className={styles.title}>{t.title}</p>
            {t.description && <p className={styles.desc}>{t.description}</p>}
          </div>
          <button className={styles.close} onClick={() => remove(t.id)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
