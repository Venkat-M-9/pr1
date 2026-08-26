'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NotificationItem, ToastOptions } from '@/types/notification';
import { subscribeToHistory, toast } from '@/lib/toast';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (opts: ToastOptions) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'app_notifications_v1';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-init-1',
    title: 'Workspace Initialized',
    description: 'Loaded master database with 5,000 enterprise records.',
    type: 'success',
    category: 'system',
    timestamp: Date.now() - 1000 * 60 * 15,
    read: true,
  },
  {
    id: 'notif-init-2',
    title: 'Financial Tier Rules Active',
    description: 'Automatic valuation tiers applied to all financial records.',
    type: 'info',
    category: 'system',
    timestamp: Date.now() - 1000 * 60 * 30,
    read: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } catch {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50))); // Keep latest 50
    } catch {
      // Ignore quota errors
    }
  }, [notifications, isInitialized]);

  // Subscribe to live notifications emitted by toast()
  useEffect(() => {
    return subscribeToHistory((newItem) => {
      setNotifications(prev => [newItem, ...prev.filter(n => n.id !== newItem.id)].slice(0, 50));
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((opts: ToastOptions) => {
    return toast(opts);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
