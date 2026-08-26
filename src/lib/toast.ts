import { NotificationItem, ToastOptions, NotificationCategory, NotificationType } from '@/types/notification';

// Simple event-based pub-sub for floating toasts and notification center
type ToastListener = (toast: NotificationItem) => void;
type HistoryListener = (notification: NotificationItem) => void;

const toastListeners: ToastListener[] = [];
const historyListeners: HistoryListener[] = [];

export function toast(opts: ToastOptions): string {
  if (typeof window !== 'undefined') {
    try {
      const pref = localStorage.getItem('pref_notifications');
      if (pref !== null && JSON.parse(pref) === false) {
        // Still register to notification history center, but suppress floating toast popup if preference is disabled
        const id = Math.random().toString(36).slice(2, 10);
        const item: NotificationItem = {
          ...opts,
          id,
          type: opts.type || 'info',
          category: opts.category || inferCategory(opts.title, opts.type),
          timestamp: Date.now(),
          read: false,
        };
        historyListeners.forEach(fn => fn(item));
        return id;
      }
    } catch {
      // Fallback
    }
  }

  const id = Math.random().toString(36).slice(2, 10);
  const item: NotificationItem = {
    ...opts,
    id,
    type: opts.type || 'info',
    category: opts.category || inferCategory(opts.title, opts.type),
    timestamp: Date.now(),
    read: false,
  };

  toastListeners.forEach(fn => fn(item));
  historyListeners.forEach(fn => fn(item));
  return id;
}

// Helpers for structured CRUD toasts
toast.success = (title: string, description?: string, options?: Partial<ToastOptions>) =>
  toast({ title, description, type: 'success', ...options });

toast.error = (title: string, description?: string, options?: Partial<ToastOptions>) =>
  toast({ title, description, type: 'error', ...options });

toast.warning = (title: string, description?: string, options?: Partial<ToastOptions>) =>
  toast({ title, description, type: 'warning', ...options });

toast.info = (title: string, description?: string, options?: Partial<ToastOptions>) =>
  toast({ title, description, type: 'info', ...options });

toast.crud = (
  category: NotificationCategory,
  title: string,
  description?: string,
  options?: Partial<ToastOptions>
) => {
  const typeMap: Record<NotificationCategory, NotificationType> = {
    create: 'success',
    update: 'info',
    delete: 'error',
    bulk_edit: 'info',
    bulk_delete: 'warning',
    import: 'success',
    export: 'info',
    star: 'info',
    settings: 'success',
    profile: 'success',
    system: 'info',
  };

  return toast({
    title,
    description,
    type: options?.type || typeMap[category] || 'info',
    category,
    ...options,
  });
};

function inferCategory(title: string, type?: NotificationType): NotificationCategory {
  const lower = title.toLowerCase();
  if (lower.includes('create') || lower.includes('added')) return 'create';
  if (lower.includes('update') || lower.includes('edit') || lower.includes('saved')) return 'update';
  if (lower.includes('delete') || lower.includes('remove')) return 'delete';
  if (lower.includes('import')) return 'import';
  if (lower.includes('export')) return 'export';
  if (lower.includes('star') || lower.includes('favorite')) return 'star';
  if (lower.includes('setting') || lower.includes('preference')) return 'settings';
  if (lower.includes('profile')) return 'profile';
  return type === 'error' ? 'system' : 'system';
}

export function subscribeToToasts(fn: ToastListener) {
  toastListeners.push(fn);
  return () => {
    const idx = toastListeners.indexOf(fn);
    if (idx > -1) toastListeners.splice(idx, 1);
  };
}

export function subscribeToHistory(fn: HistoryListener) {
  historyListeners.push(fn);
  return () => {
    const idx = historyListeners.indexOf(fn);
    if (idx > -1) historyListeners.splice(idx, 1);
  };
}

export type { ToastOptions };
