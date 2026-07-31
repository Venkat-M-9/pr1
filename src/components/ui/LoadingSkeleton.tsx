import styles from './LoadingSkeleton.module.css';

interface Props {
  rows?: number;
  cols?: number;
  type?: 'table' | 'card' | 'text';
}

export default function LoadingSkeleton({ rows = 8, cols = 5, type = 'table' }: Props) {
  if (type === 'card') {
    return (
      <div className={styles.cardGrid}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={`${styles.bone} ${styles.cardTitle}`} />
            <div className={`${styles.bone} ${styles.cardValue}`} />
            <div className={`${styles.bone} ${styles.cardSub}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={styles.textBlock}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`${styles.bone} ${styles.textLine}`}
            style={{ width: `${60 + (i % 3) * 15}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.table}>
      {/* Header */}
      <div className={`${styles.row} ${styles.header}`}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className={`${styles.bone} ${styles.headerCell}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={styles.row}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={`${styles.bone} ${styles.cell}`}
              style={{ width: `${55 + ((r + c) % 4) * 10}%`, animationDelay: `${(r * cols + c) * 30}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
