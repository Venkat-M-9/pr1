'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { toast } from '@/lib/toast';
import styles from './TopBar.module.css';

interface Props {
  title?: string;
  onMobileMenuToggle?: () => void;
}

export default function TopBar({ title, onMobileMenuToggle }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {onMobileMenuToggle && (
          <button
            className={styles.mobileMenuBtn}
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={() => toast({ title: 'Notifications', description: 'No new unread messages.', type: 'info' })}
          aria-label="View notifications"
        >
          <Bell size={16} />
        </button>

        <button
          className={styles.iconBtn}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className={styles.userBadge}>
          <div className={styles.avatar}>AD</div>
          <span className={styles.userName}>Admin User</span>
        </div>
      </div>
    </header>
  );
}
