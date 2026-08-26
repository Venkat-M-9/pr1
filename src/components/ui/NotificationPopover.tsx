'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Plus,
  Edit3,
  Upload,
  Download,
  Star,
  Settings,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Inbox,
} from 'lucide-react';
import styles from './NotificationPopover.module.css';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  create: <Plus size={15} />,
  update: <Edit3 size={14} />,
  delete: <Trash2 size={14} />,
  bulk_edit: <Layers size={14} />,
  bulk_delete: <Trash2 size={14} />,
  import: <Upload size={14} />,
  export: <Download size={14} />,
  star: <Star size={14} />,
  settings: <Settings size={14} />,
  profile: <Settings size={14} />,
  system: <Info size={14} />,
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  create: { bg: 'rgba(40, 167, 69, 0.12)', color: 'var(--success)' },
  update: { bg: 'rgba(13, 110, 253, 0.12)', color: 'var(--info)' },
  delete: { bg: 'rgba(220, 53, 69, 0.12)', color: 'var(--danger)' },
  bulk_edit: { bg: 'rgba(111, 66, 193, 0.12)', color: '#8b5cf6' },
  bulk_delete: { bg: 'rgba(220, 53, 69, 0.12)', color: 'var(--danger)' },
  import: { bg: 'rgba(20, 184, 166, 0.12)', color: '#0d9488' },
  export: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' },
  star: { bg: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' },
  settings: { bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text)' },
  profile: { bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text)' },
  system: { bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-muted)' },
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationPopover() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'crud'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'crud') {
      return ['create', 'update', 'delete', 'bulk_edit', 'bulk_delete', 'import', 'export', 'star'].includes(
        n.category || ''
      );
    }
    return true;
  });

  return (
    <div className={styles.wrapper} ref={popoverRef}>
      <button
        className={`${styles.bellBtn} ${isOpen ? styles.bellBtnActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications (${unreadCount} unread)`}
        title="View Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label="Notifications Panel">
          <div className={styles.header}>
            <div className={styles.headerTitleRow}>
              <span className={styles.title}>Notifications</span>
              {unreadCount > 0 && (
                <span className={styles.headerBadge}>{unreadCount} new</span>
              )}
            </div>

            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  className={styles.textBtn}
                  onClick={markAllAsRead}
                  title="Mark all notifications as read"
                >
                  <CheckCheck size={13} style={{ marginRight: 4 }} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className={styles.textBtn}
                  onClick={clearAll}
                  title="Clear all notification history"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'unread' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'crud' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('crud')}
            >
              Operations
            </button>
          </div>

          <div className={styles.list}>
            {filteredNotifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Inbox size={28} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>
                  {activeTab === 'unread'
                    ? 'No unread notifications'
                    : activeTab === 'crud'
                    ? 'No data operations logged'
                    : 'No notifications yet'}
                </p>
                <p className={styles.emptySubtitle}>
                  Data operations (Create, Edit, Delete, Import) and system alerts will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredNotifications.map(n => {
                const category = n.category || 'system';
                const style = CATEGORY_COLORS[category] || CATEGORY_COLORS.system;
                const icon = CATEGORY_ICONS[category] || <Info size={14} />;

                return (
                  <div
                    key={n.id}
                    className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div
                      className={styles.itemIcon}
                      style={{ background: style.bg, color: style.color }}
                    >
                      {icon}
                    </div>

                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>{n.title}</span>
                        <span className={styles.itemTime}>{formatTimeAgo(n.timestamp)}</span>
                      </div>

                      {n.description && <p className={styles.itemDesc}>{n.description}</p>}

                      <div className={styles.itemFooter}>
                        <span
                          className={styles.badge}
                          style={{
                            background: style.bg,
                            color: style.color,
                            borderColor: style.color,
                          }}
                        >
                          {category.replace('_', ' ')}
                        </span>

                        {!n.read && <span className={styles.unreadDot} title="Unread" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className={styles.footer}>
              <span>Showing {filteredNotifications.length} of {notifications.length} events</span>
              <span>Real-time Sync Active</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
