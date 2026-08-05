'use client';

import { Record as SystemRecord } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import { Star, Edit3, Trash2 } from 'lucide-react';

interface Props {
  record: SystemRecord;
  onToggleStar?: (id: string) => void;
  onEdit?: (record: SystemRecord) => void;
  onDelete?: (record: SystemRecord) => void;
}

export default function RecordDetailView({ record, onToggleStar, onEdit, onDelete }: Props) {
  const isStarred = Boolean(record.starred);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Action Bar inside Detail Drawer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Record ID</span>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{record.id}</h3>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onToggleStar && (
            <button
              type="button"
              onClick={() => onToggleStar(record.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: isStarred ? 'rgba(245, 158, 11, 0.1)' : 'var(--surface)',
                color: isStarred ? '#d97706' : 'var(--text)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              title={isStarred ? 'Unstar record' : 'Star record'}
            >
              <Star size={15} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
              <span>{isStarred ? 'Starred' : 'Star'}</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(record)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              title="Edit record"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(record)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              title="Delete record"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Title / Name</span>
        <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{record.name}</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
          <div style={{ marginTop: 4 }}>
            <StatusBadge value={record.status} variant="status" />
          </div>
        </div>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority</span>
          <div style={{ marginTop: 4 }}>
            <StatusBadge value={record.priority} variant="priority" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Category</span>
          <p style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{record.category}</p>
        </div>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Owner</span>
          <p style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{record.owner}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created At</span>
          <p style={{ fontSize: 13, marginTop: 2 }}>{record.createdAt}</p>
        </div>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated At</span>
          <p style={{ fontSize: 13, marginTop: 2 }}>{record.updatedAt}</p>
        </div>
      </div>

      <div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Financial Value</span>
        <p style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>${record.value.toLocaleString()}</p>
      </div>

      {record.tags && record.tags.length > 0 && (
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tags</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {record.tags.map(t => (
              <StatusBadge key={t} value={t} variant="tag" />
            ))}
          </div>
        </div>
      )}

      <div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Description</span>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
          {record.description}
        </p>
      </div>
    </div>
  );
}
