import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './ErrorState.module.css';

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}><AlertCircle size={32} /></div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      {onRetry && (
        <button className={styles.btn} onClick={onRetry}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
