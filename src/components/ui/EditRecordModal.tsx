'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Record as SystemRecord, Status, Priority, Category } from '@/lib/mockData';

interface Props {
  open: boolean;
  onClose: () => void;
  record: SystemRecord | null;
  onSave: (updatedRecord: SystemRecord) => void;
}

const STATUSES: Status[] = ['active', 'inactive', 'pending', 'archived'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const CATEGORIES: Category[] = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

export default function EditRecordModal({ open, onClose, record, onSave }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('alpha');
  const [owner, setOwner] = useState('');
  const [value, setValue] = useState<number>(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (record) {
      setName(record.name);
      setStatus(record.status);
      setPriority(record.priority);
      setCategory(record.category);
      setOwner(record.owner);
      setValue(record.value);
      setDescription(record.description || '');
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...record,
      name,
      status,
      priority,
      category,
      owner,
      value: Number(value) || 0,
      description,
    });
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
      title={`Edit Record ${record.id}`}
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
            form="edit-record-form"
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
            Save Changes
          </button>
        </div>
      }
    >
      <form id="edit-record-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Record Title / Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Status)}
              style={inputStyle}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              style={inputStyle}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              style={inputStyle}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Owner</label>
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
          <label style={labelStyle}>Financial Value ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={e => setValue(parseFloat(e.target.value) || 0)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
}
