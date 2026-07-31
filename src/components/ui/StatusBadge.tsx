import styles from './StatusBadge.module.css';

type Status = 'active' | 'inactive' | 'pending' | 'archived';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Props {
  value: Status | Priority | string;
  variant?: 'status' | 'priority' | 'tag';
}

export default function StatusBadge({ value, variant = 'status' }: Props) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[value] ?? ''}`}>
      {variant === 'status' && <span className={styles.dot} />}
      {value}
    </span>
  );
}
