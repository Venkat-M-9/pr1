'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Record as SystemRecord, Status, Priority, getPriorityFromValue } from '@/lib/mockData';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (record: SystemRecord) => void;
}

const STATUSES: Status[] = ['active', 'inactive', 'pending', 'archived'];

export default function CreateRecordModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [owner, setOwner] = useState('Sarah Connor (SOC Lead)');
  const [value, setValue] = useState<number>(65);
  const [description, setDescription] = useState('');

  const currentPriority = getPriorityFromValue(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = Math.min(100, Math.max(0, Number(value) || 0));
    const today = new Date().toISOString().split('T')[0];
    const newId = `AST-${Math.floor(Math.random() * 90000 + 10000)}`;

    const newRecord: SystemRecord = {
      id: newId,
      name: name || 'Untitled Asset',
      status,
      priority: getPriorityFromValue(numVal),
      owner: owner || 'Sarah Connor (SOC Lead)',
      value: numVal,
      progress: Math.floor(Math.random() * 100),
      tags: ['Manual Entry', 'Monitored Asset'],
      description: description || 'Directly registered in SOC Asset Manager.',
      createdAt: today,
      updatedAt: today,
      starred: false,
    };

    onCreate(newRecord);
    // Reset form
    setName('');
    setValue(65);
    setDescription('');
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
      title="Register Monitored Asset"
      size="md"
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
            form="create-record-form"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Register Asset
          </button>
        </div>
      }
    >
      <form id="create-record-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Asset / Infrastructure Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Core PostgreSQL DB Cluster #104"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Monitoring Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Status)}
              style={inputStyle}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s === 'active' ? 'Active Monitoring' : s === 'inactive' ? 'Offline' : s === 'pending' ? 'Remediation Pending' : 'Archived'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>SecOps Lead / Owner</label>
            <input
              type="text"
              required
              value={owner}
              onChange={e => setOwner(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Threat Risk Score (0 - 100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={e => setValue(parseInt(e.target.value) || 0)}
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Threat Severity: <strong style={{ textTransform: 'capitalize', color: currentPriority === 'critical' ? '#dc3545' : currentPriority === 'high' ? '#ea580c' : '#2563eb' }}>{currentPriority}</strong> (Critical: 75+, High: 50-74, Medium: 25-49, Low: &lt;25)
          </p>
        </div>

        <div>
          <label style={labelStyle}>Security Description &amp; Scope</label>
          <textarea
            rows={3}
            placeholder="Provide infrastructure details, subnet, and known CVE exposures..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
}
