import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Simple event-based toast system
const listeners: ((opts: ToastOptions & { id: string }) => void)[] = [];

export function toast(opts: ToastOptions) {
  const id = Math.random().toString(36).slice(2);
  listeners.forEach(fn => fn({ ...opts, id }));
}

export function subscribeToToasts(fn: (opts: ToastOptions & { id: string }) => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export type { ToastOptions };
