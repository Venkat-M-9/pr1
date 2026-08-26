export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationCategory =
  | 'create'
  | 'update'
  | 'delete'
  | 'bulk_edit'
  | 'bulk_delete'
  | 'import'
  | 'export'
  | 'star'
  | 'settings'
  | 'profile'
  | 'system';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  category?: NotificationCategory;
  timestamp: number;
  read: boolean;
  duration?: number;
  recordId?: string;
  recordName?: string;
  undo?: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  duration?: number;
  recordId?: string;
  recordName?: string;
  undo?: () => void;
}
