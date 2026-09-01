'use client';

import { ReactNode } from 'react';
import styles from './PageShell.module.css';
import TopBar from './TopBar';

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
        <div className={styles.topRow}>
          <div className={styles.titleMain}>
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
            <div className={styles.titleWrap}>
              <h1 className={styles.title}>{title}</h1>
              {description && <span className={styles.description}>{description}</span>}
            </div>
          </div>
          
          <div className={styles.globalControls}>
            {actions && <div className={styles.actions} style={{ marginRight: 16 }}>{actions}</div>}
            <TopBar />
          </div>
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
