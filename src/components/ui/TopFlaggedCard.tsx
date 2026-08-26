'use client';

import { useMemo } from 'react';
import { Record as SystemRecord } from '@/lib/mockData';

interface Props {
  records: SystemRecord[];
  onSelectRecord?: (record: SystemRecord) => void;
}

export default function TopFlaggedCard({ records, onSelectRecord }: Props) {
  // Sort dynamically by highest risk score to get top 4 highest exposure assets
  const topRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [records]);

  const getScoreColor = (priority: string, score: number) => {
    if (priority === 'critical' || score >= 75) return { bg: 'rgba(220, 53, 69, 0.12)', text: '#dc3545', border: 'rgba(220, 53, 69, 0.25)' };
    if (priority === 'high' || score >= 50) return { bg: 'rgba(234, 88, 12, 0.12)', text: '#ea580c', border: 'rgba(234, 88, 12, 0.25)' };
    return { bg: 'rgba(37, 99, 235, 0.12)', text: '#2563eb', border: 'rgba(37, 99, 235, 0.25)' };
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
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Top High-Risk Crown Jewels</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Critical infrastructure ranked by composite threat exposure index
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topRecords.map((item) => {
          const score = item.value;
          const color = getScoreColor(item.priority, score);
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
                  {item.owner} · <strong style={{ color: color.text }}>Risk: {item.value}/100</strong> ({item.priority.toUpperCase()})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
