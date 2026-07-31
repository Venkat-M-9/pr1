'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  FileText,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sliders,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Data Management', href: '/data', icon: Database },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'User Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Sliders size={18} />
          </div>
          {!collapsed && <span className={styles.brand}>System Console</span>}
        </div>
        <button className={styles.toggleBtn} onClick={onToggle} aria-label="Toggle navigation">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={styles.icon} />
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/login" className={styles.logoutBtn} title={collapsed ? 'Sign Out' : undefined}>
          <LogOut size={16} className={styles.icon} />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}
