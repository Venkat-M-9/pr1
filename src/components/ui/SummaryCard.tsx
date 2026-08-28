import { ReactNode } from 'react';
import styles from './SummaryCard.module.css';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  iconColor?: string;
  iconBg?: string;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  iconColor,
  iconBg,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && (
          <div
            className={styles.iconBadge}
            style={{
              color: iconColor || 'inherit',
              background: iconBg || 'var(--bg)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      {trend && (
        <div className={`${styles.trend} ${trend.value >= 0 ? styles.positive : styles.negative}`}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
