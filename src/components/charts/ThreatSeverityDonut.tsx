'use client';

import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ThreatSeverity } from '@/types/cybersecurity';
import { MitreMatrixIcon } from '@/components/ui/CyberIcons';
import styles from './ThreatSeverityDonut.module.css';

export interface SeverityDataPoint {
  name: string;
  severity: ThreatSeverity;
  count: number;
  color: string;
}

interface Props {
  data: SeverityDataPoint[];
  selectedSeverity?: ThreatSeverity | null;
  onSelectSeverity?: (severity: ThreatSeverity | null) => void;
}

export default function ThreatSeverityDonut({
  data,
  selectedSeverity,
  onSelectSeverity,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <MitreMatrixIcon size={18} color="var(--accent)" />
            <h3 className={styles.title}>Threat Severity Breakdown</h3>
          </div>
          <p className={styles.subtitle}>Volume and proportional distribution by threat impact</p>
        </div>
        <span className={styles.badge}>{total.toLocaleString()} Total</span>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={entry => {
                const target = (entry as any)?.severity === selectedSeverity ? null : (entry as any)?.severity;
                if (target !== undefined) onSelectSeverity?.(target);
              }}
              cursor="pointer"
            >
              {data.map((entry, index) => {
                const isHovered = activeIndex === index;
                const isSelected = selectedSeverity === entry.severity;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={isSelected || isHovered ? 'var(--text)' : 'transparent'}
                    strokeWidth={isSelected || isHovered ? 2 : 0}
                    opacity={selectedSeverity && !isSelected ? 0.35 : 1}
                  />
                );
              })}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as SeverityDataPoint;
                  const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0';
                  return (
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                        <strong style={{ color: 'var(--text)' }}>{d.name} Severity</strong>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                        Count: <strong style={{ color: 'var(--text)' }}>{d.count.toLocaleString()}</strong> ({pct}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Dynamic Stat */}
        <div className={styles.centerStats}>
          <div className={styles.centerValue}>
            {activeItem
              ? `${((activeItem.count / total) * 100).toFixed(0)}%`
              : total.toLocaleString()}
          </div>
          <div className={styles.centerLabel}>
            {activeItem ? activeItem.name : 'Total Events'}
          </div>
        </div>
      </div>

      {/* Interactive Legend with Exact Counts & Percentages */}
      <div className={styles.legendList}>
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
          const isSelected = selectedSeverity === item.severity;
          return (
            <div
              key={item.severity}
              className={`${styles.legendCard} ${isSelected ? styles.legendCardActive : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => {
                const next = selectedSeverity === item.severity ? null : item.severity;
                onSelectSeverity?.(next);
              }}
            >
              <div className={styles.legendCardLeft}>
                <span className={styles.legendDot} style={{ background: item.color }} />
                <span className={styles.legendName}>{item.name}</span>
              </div>
              <div className={styles.legendValues}>
                <span className={styles.legendCount}>{item.count.toLocaleString()}</span>
                <span className={styles.legendPct}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
