'use client';

import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'audit' | 'financial' | 'raw'>('audit');
  const isStarred = Boolean(record.starred);

  // 100% Dynamic Audit Events constructed directly from real record attributes
  const dynamicAuditEvents = [
    {
      severity: record.priority === 'critical' || record.priority === 'high' ? 'High' : 'Medium',
      rule: `Money-based Priority set to ${record.priority.toUpperCase()}`,
      triggered: record.updatedAt,
      scope: 'Financial',
      status: record.status,
    },
    {
      severity: record.value >= 50000 ? 'High' : 'Low',
      rule: `Financial evaluation registered ($${record.value.toLocaleString()})`,
      triggered: record.createdAt,
      scope: 'Valuation',
      status: 'active',
    },
    {
      severity: 'Low',
      rule: `Record owner assigned to ${record.owner}`,
      triggered: record.createdAt,
      scope: 'System',
      status: 'active',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Action Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{record.id}</h3>
            <StatusBadge value={record.status} variant="status" />
            <StatusBadge value={record.priority} variant="priority" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Assigned to {record.owner} · {record.description}
          </p>
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
            >
              <Star size={14} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
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
                border: '1px solid #fce8e6',
                background: '#fce8e6',
                color: '#c5221f',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          padding: '16px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{record.name}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created At</span>
          <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{record.createdAt}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Updated At</span>
          <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{record.updatedAt}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Value</span>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1e7e34', marginTop: 4 }}>${record.value.toLocaleString()}</p>
        </div>
      </div>

      {/* Sub-Tabs: Audit Events | Financial Audit | Raw Fields */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 20 }}>
        {(['audit', 'financial', 'raw'] as const).map(tab => {
          const labelMap = { audit: 'Audit Events', financial: 'Financial Audit', raw: 'Raw Fields' };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 0',
                border: 'none',
                background: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid var(--text)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {labelMap[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'audit' && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Severity</th>
                <th style={{ padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Audit Rule</th>
                <th style={{ padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Triggered Date</th>
                <th style={{ padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Scope</th>
                <th style={{ padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dynamicAuditEvents.map((row, i) => (
                <tr key={i} style={{ borderBottom: i === dynamicAuditEvents.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.severity === 'High' ? '#c5221f' : row.severity === 'Medium' ? '#b06000' : '#1e7e34' }} />
                    <span style={{ fontWeight: 500 }}>{row.severity}</span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>{row.rule}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{row.triggered}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{row.scope}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <StatusBadge value={row.status} variant="status" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'financial' && (
        <div style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Evaluation Value:</span>
            <strong style={{ color: '#1e7e34' }}>${record.value.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Money-Based Priority:</span>
            <strong style={{ textTransform: 'capitalize' }}>{record.priority}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Completion Progress:</span>
            <strong>{record.progress}%</strong>
          </div>
        </div>
      )}

      {activeTab === 'raw' && (
        <pre style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: 11, overflowX: 'auto', color: 'var(--text)' }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      )}
    </div>
  );
}
