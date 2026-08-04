'use client';

import { ReactNode } from 'react';
import Modal from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmDialog — Challenge 10: Real-World Reliability.
 * Standard confirmation dialog for destructive or high-impact actions.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '6px 14px',
              background: variant === 'danger' ? 'var(--danger)' : 'var(--accent)',
              color: 'var(--accent-fg)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <AlertTriangle
          size={20}
          style={{ color: variant === 'danger' ? 'var(--danger)' : 'var(--warning)', flexShrink: 0, marginTop: 2 }}
        />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
      </div>
    </Modal>
  );
}
