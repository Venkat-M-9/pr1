'use client';

import { useState } from 'react';
import { Record as SystemRecord } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import { Star, Edit3, Trash2, Copy } from 'lucide-react';

interface Props {
  record: SystemRecord;
  onToggleStar?: (id: string) => void;
  onEdit?: (record: SystemRecord) => void;
  onDelete?: (record: SystemRecord) => void;
}

export default function RecordDetailView({ record, onToggleStar, onEdit, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<'audit' | 'security' | 'raw'>('audit');
  const isStarred = Boolean(record.starred);

  // Dynamic Audit Events constructed directly from real asset attributes
  const dynamicAuditEvents = [
    {
      severity: record.priority === 'critical' || record.priority === 'high' ? 'High' : 'Medium',
      rule: `Threat Severity Level evaluated at ${record.priority.toUpperCase()}`,
      triggered: record.updatedAt,
      scope: 'Threat Detection',
      status: record.status,
    },
    {
      severity: record.value >= 75 ? 'High' : record.value >= 50 ? 'Medium' : 'Low',
      rule: `Composite Risk Score calculated (${record.value}/100 Exposure Index)`,
      triggered: record.createdAt,
      scope: 'Vulnerability Assessment',
      status: 'active',
    },
    {
      severity: 'Low',
      rule: `Assigned SOC Lead: ${record.owner}`,
      triggered: record.createdAt,
      scope: 'Access Control',
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
            SecOps Owner: {record.owner} · {record.description}
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
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset / Target</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{record.name}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discovered</span>
          <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{record.createdAt}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Scanned</span>
          <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{record.updatedAt}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Score</span>
          <p style={{ fontSize: 14, fontWeight: 700, color: record.value >= 75 ? '#dc3545' : record.value >= 50 ? '#ea580c' : '#2563eb', marginTop: 4 }}>
            {record.value} / 100
          </p>
        </div>
      </div>

      {/* Sub-Tabs: Audit Events | Security Risk | Raw Fields */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 20 }}>
        {(['audit', 'security', 'raw'] as const).map(tab => {
          const labelMap = { audit: 'Audit Log Events', security: 'Security Risk Audit', raw: 'Raw Telemetry' };
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

      {activeTab === 'security' && (
        <div style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Threat Risk Score:</span>
            <strong style={{ color: record.value >= 75 ? '#dc3545' : record.value >= 50 ? '#ea580c' : '#2563eb' }}>
              {record.value} / 100
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Threat Severity Level:</span>
            <strong style={{ textTransform: 'capitalize' }}>{record.priority}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Remediation Progress:</span>
            <strong>{record.progress}% Complete</strong>
          </div>
        </div>
      )}

      {activeTab === 'raw' && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              navigator.clipboard.writeText(JSON.stringify(record, null, 2));
              const btn = e.currentTarget;
              const originalColor = btn.style.color;
              btn.style.color = 'var(--accent)';
              setTimeout(() => { btn.style.color = originalColor; }, 1000);
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: 4,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition)'
            }}
            title="Copy Raw Telemetry"
          >
            <Copy size={14} />
          </button>
          <pre style={{ padding: 12, paddingTop: 32, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: 11, overflowX: 'auto', color: 'var(--text)' }}>
            {JSON.stringify(record, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
