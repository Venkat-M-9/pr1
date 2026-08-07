'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Status, Priority } from '@/lib/mockData';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  onSave: (updates: { status?: Status; priority?: Priority }) => void;
}

const STATUSES: Status[] = ['active', 'inactive', 'pending', 'archived'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export default function BulkEditModal({ open, onClose, selectedCount, onSave }: Props) {
  const [status, setStatus] = useState<Status | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { status?: Status; priority?: Priority } = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    onSave(updates);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: 14,
    marginTop: 4,
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text)',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Bulk Edit ${selectedCount} Selected Records`}
      size="sm"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bulk-edit-form"
            disabled={!status && !priority}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              fontSize: 13,
              fontWeight: 500,
              cursor: !status && !priority ? 'not-allowed' : 'pointer',
              opacity: !status && !priority ? 0.6 : 1,
            }}
          >
            Apply Changes to {selectedCount} Items
          </button>
        </div>
      }
    >
      <form id="bulk-edit-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Select fields to update for all <strong>{selectedCount}</strong> currently selected records:
        </p>

        <div>
          <label style={labelStyle}>Update Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            style={inputStyle}
          >
            <option value="">-- No Change --</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Update Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            style={inputStyle}
          >
            <option value="">-- No Change --</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
