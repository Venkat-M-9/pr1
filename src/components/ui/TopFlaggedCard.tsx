'use client';

import { useMemo } from 'react';
import { Record as SystemRecord } from '@/lib/mockData';

interface Props {
  records: SystemRecord[];
  onSelectRecord?: (record: SystemRecord) => void;
}

export default function TopFlaggedCard({ records, onSelectRecord }: Props) {
  // Sort 100% dynamically by highest dollar value ($) to get top 4 highest impact records
  const topRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [records]);

  const getScoreColor = (priority: string, idx: number) => {
    if (priority === 'critical' || idx === 0) return { bg: '#fce8e6', text: '#c5221f', border: '#f7c5c2' };
    if (priority === 'high' || idx <= 2) return { bg: '#feefc3', text: '#b06000', border: '#fce49d' };
    return { bg: '#edf4fc', text: '#2563eb', border: '#b8d5fb' };
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
          Highest valuation entities requiring attention
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topRecords.map((item, idx) => {
          // Dynamic financial risk score derived directly from dollar value
          const score = Math.min(99, Math.max(15, Math.round((item.value / 150000) * 100)));
          const color = getScoreColor(item.priority, idx);
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
                  {item.owner} · <strong style={{ color: 'var(--text)' }}>${item.value.toLocaleString()}</strong> ({item.priority.toUpperCase()})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
