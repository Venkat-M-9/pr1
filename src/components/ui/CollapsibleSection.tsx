'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CollapsibleSection.module.css';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

/**
 * CollapsibleSection — Challenge 5: Information Density.
 * Lets users collapse/expand content blocks to control how much
 * information is displayed at once, keeping the UI uncluttered.
 */
export default function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
  badge,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <div className={styles.left}>
          <span className={styles.title}>{title}</span>
          {badge !== undefined && (
            <span className={styles.badge}>{badge}</span>
          )}
        </div>
        <div className={styles.right}>
          {subtitle && !open && (
            <span className={styles.subtitle}>{subtitle}</span>
          )}
          <ChevronDown
            size={16}
            className={`${styles.icon} ${open ? styles.open : ''}`}
          />
        </div>
      </button>

      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}
