'use client';

import { Record as SystemRecord } from '@/lib/mockData';

interface Props {
  records: SystemRecord[];
  onSelectRecord?: (record: SystemRecord) => void;
}

export default function TopFlaggedCard({ records, onSelectRecord }: Props) {
  // Sort by highest value or critical priority to match "Top flagged personnel"
  const topRecords = [...records]
    .filter(r => r.priority === 'critical' || r.priority === 'high' || r.starred)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const getScoreColor = (index: number, priority: string) => {
    if (priority === 'critical' || index === 0) return { bg: '#fce8e6', text: '#c5221f', border: '#f7c5c2' };
    if (priority === 'high' || index <= 2) return { bg: '#feefc3', text: '#b06000', border: '#fce49d' };
    return { bg: '#f1f3f4', text: '#5f6368', border: '#e0e0e0' };
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Top Flagged Records</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          High impact entities requiring attention
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topRecords.map((item, idx) => {
          const score = Math.round(92 - idx * 16);
          const color = getScoreColor(idx, item.priority);
          return (
            <div
              key={item.id}
              onClick={() => onSelectRecord?.(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {score}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.id} · {item.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.owner} · ${item.value.toLocaleString()} value
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
