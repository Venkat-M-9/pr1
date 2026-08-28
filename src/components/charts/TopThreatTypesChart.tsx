'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ThreatSeverity } from '@/types/cybersecurity';
import { FlameAlertIcon } from '@/components/ui/CyberIcons';
import styles from './TopThreatTypesChart.module.css';

export interface ThreatTypeItem {
  type: string;
  count: number;
  tactic: string;
  techniqueId: string;
  severity: ThreatSeverity;
}

interface Props {
  data: ThreatTypeItem[];
  onSelectThreatType?: (threat: ThreatTypeItem) => void;
}

const SEVERITY_COLORS: Record<ThreatSeverity, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#2563eb',
};

import { useState } from 'react';

export default function TopThreatTypesChart({ data, onSelectThreatType }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Sort descending and cap at Top 10
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  const handleBarClick = (item: any) => {
    const payload = item?.payload || item;
    if (payload) {
      setSelectedType(payload.type);
      onSelectThreatType?.(payload);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <FlameAlertIcon size={18} color="#ea580c" />
            <h3 className={styles.title}>Top 10 Detected Threat Vectors</h3>
          </div>
          <p className={styles.subtitle}>Most prevalent attack vectors identified across all sensors</p>
        </div>
        <span className={styles.badge}>Top 10 Vectors</span>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.6} />
            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="type"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              width={140}
              tick={{ fill: 'var(--text)' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ThreatTypeItem;
                  const sevColor = SEVERITY_COLORS[d.severity] || '#2563eb';
                  return (
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)',
                        fontSize: '12px',
                        minWidth: 180,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <strong style={{ color: 'var(--text)' }}>{d.type}</strong>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            background: `${sevColor}20`,
                            color: sevColor,
                          }}
                        >
                          {d.severity}
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 2px', color: 'var(--text-muted)' }}>
                        Detected Events: <strong style={{ color: 'var(--text)' }}>{d.count.toLocaleString()}</strong>
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-faint)' }}>
                        MITRE: {d.techniqueId} · {d.tactic}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {sortedData.map((entry, index) => {
                const color = SEVERITY_COLORS[entry.severity] || '#2563eb';
                const isSelected = selectedType === entry.type;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={selectedType && !isSelected ? 0.45 : 1}
                    stroke={isSelected ? '#ffffff' : color}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
