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

  const getScoreBadge = (score: number) => {
    if (score >= 75) return { dot: '#ef4444', text: '#ef4444' };
    if (score >= 50) return { dot: '#f97316', text: '#f97316' };
    return { dot: '#3b82f6', text: '#3b82f6' };
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topRecords.map((item) => {
          const score = item.value;
          const badge = getScoreBadge(score);
          return (
            <div
              key={item.id}
              onClick={() => onSelectRecord?.(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <div
                style={{
                  minWidth: 42,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text)',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot }} />
                {score}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.id} · {item.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.owner} · <span style={{ color: badge.text, fontWeight: 600 }}>{item.priority.toUpperCase()}</span> (Risk: {item.value}/100)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
