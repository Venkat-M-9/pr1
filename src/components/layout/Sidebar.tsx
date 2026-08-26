'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Server,
  BarChart3,
  FileText,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'SOC Overview', href: '/', icon: ShieldAlert },
  { label: 'Asset Management', href: '/data', icon: Server },
  { label: 'Threat Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Audit Reports', href: '/reports', icon: FileText },
  { label: 'SecOps Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div className={styles.overlay} onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${
          mobileOpen ? styles.mobileOpen : ''
        }`}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Shield size={18} />
            </div>
            {(!collapsed || mobileOpen) && <span className={styles.brand}>CyberSOC</span>}
          </div>
          <button className={styles.toggleBtn} onClick={onToggle} aria-label="Toggle navigation">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {mobileOpen && onMobileClose && (
            <button className={styles.mobileCloseBtn} onClick={onMobileClose} aria-label="Close menu">
              <X size={18} />
            </button>
          )}
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
                title={collapsed && !mobileOpen ? item.label : undefined}
                onClick={onMobileClose}
              >
                <Icon size={18} className={styles.icon} />
                {(!collapsed || mobileOpen) && <span className={styles.label}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <Link
            href="/login"
            className={styles.logoutBtn}
            title={collapsed && !mobileOpen ? 'Sign Out' : undefined}
            onClick={onMobileClose}
          >
            <LogOut size={16} className={styles.icon} />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
