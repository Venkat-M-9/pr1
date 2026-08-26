'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { subscribeToToasts } from '@/lib/toast';
import { NotificationItem, NotificationCategory } from '@/types/notification';
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Download,
  Star,
  Settings,
  Layers,
} from 'lucide-react';
import styles from './ToastContainer.module.css';

interface ToastItem extends NotificationItem {
  removing?: boolean;
  paused?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  create: <Plus size={16} />,
  update: <Edit3 size={15} />,
  delete: <Trash2 size={15} />,
  bulk_edit: <Layers size={15} />,
  bulk_delete: <Trash2 size={15} />,
  import: <Upload size={15} />,
  export: <Download size={15} />,
  star: <Star size={15} />,
  settings: <Settings size={15} />,
};

const TYPE_ICONS = {
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const CATEGORY_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  bulk_edit: 'Batch Edit',
  bulk_delete: 'Batch Delete',
  import: 'Imported',
  export: 'Exported',
  star: 'Starred',
  settings: 'Settings',
  profile: 'Profile',
  system: 'System',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      if (timeoutsRef.current.has(id)) {
        clearTimeout(timeoutsRef.current.get(id));
        timeoutsRef.current.delete(id);
      }
    }, 250);
  }, []);

  const scheduleRemoval = useCallback((id: string, duration: number) => {
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id));
    }
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    timeoutsRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    return subscribeToToasts((t) => {
      const duration = t.duration ?? (t.type === 'error' ? 6000 : 4500);
      setToasts(prev => [t, ...prev.slice(0, 4)]); // Show max 5 toasts at once
      scheduleRemoval(t.id, duration);
    });
  }, [scheduleRemoval]);

  if (!toasts.length) return null;

  return (
    <div className={styles.container} role="region" aria-label="Notifications">
      {toasts.map(t => {
        const category = t.category || 'system';
        const icon = CATEGORY_ICONS[category] || TYPE_ICONS[t.type ?? 'info'];
        const badgeClass = styles[`badge_${category.split('_')[0]}`] || styles.badge;
        const duration = t.duration ?? (t.type === 'error' ? 6000 : 4500);

        return (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[t.type ?? 'info']} ${t.removing ? styles.removing : ''}`}
            role="alert"
          >
            <div className={styles.content}>
              <span className={styles.iconWrapper}>{icon}</span>
              
              <div className={styles.body}>
                <div className={styles.headerRow}>
                  <p className={styles.title}>{t.title}</p>
                  {CATEGORY_LABELS[category] && (
                    <span className={`${styles.badge} ${badgeClass}`}>
                      {CATEGORY_LABELS[category]}
                    </span>
                  )}
                </div>
                
                {t.description && <p className={styles.desc}>{t.description}</p>}

                {t.undo && (
                  <div className={styles.actions}>
                    <button
                      className={styles.undoBtn}
                      onClick={() => {
                        t.undo?.();
                        removeToast(t.id);
                      }}
                    >
                      <RotateCcw size={12} /> Undo Action
                    </button>
                  </div>
                )}
              </div>

              <button
                className={styles.close}
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ animationDuration: `${duration}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
