'use client';

import { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children: ReactNode;
}

export default function PageShell({ title, description, actions, breadcrumbs, children }: Props) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        {breadcrumbs && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((b, i) => (
              <span key={i} className={styles.crumb}>
                {i > 0 && <span className={styles.sep}>/</span>}
                {b.href ? <a href={b.href}>{b.label}</a> : <span>{b.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
