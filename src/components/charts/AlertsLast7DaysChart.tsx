'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts';
import styles from './AlertsLast7DaysChart.module.css';

export interface DayAlertPoint {
  day: string;
  low: number;
  medium: number;
  high: number;
}

interface Props {
  data?: DayAlertPoint[];
}

// Default 7-day progression matching the reference image curve
const DEFAULT_7_DAY_DATA: DayAlertPoint[] = [
  { day: 'Mon', low: 22, medium: 28, high: 24 },
  { day: 'Tue', low: 34, medium: 46, high: 32 },
  { day: 'Wed', low: 20, medium: 24, high: 16 },
  { day: 'Thu', low: 32, medium: 48, high: 42 },
  { day: 'Fri', low: 28, medium: 38, high: 30 },
  { day: 'Sat', low: 16, medium: 20, high: 14 },
  { day: 'Today', low: 36, medium: 54, high: 58 },
];

export default function AlertsLast7DaysChart({ data }: Props) {
  const chartData = useMemo(() => data || DEFAULT_7_DAY_DATA, [data]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Analytical Threat Visualizations</h3>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
            barSize={28}
          >
            <XAxis
              dataKey="day"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const total = payload.reduce((acc, p) => acc + Number(p.value || 0), 0);
                  return (
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)',
                        fontSize: '12px',
                        minWidth: 150,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, borderBottom: '1px solid var(--border)', paddingBottom: 3 }}>
                        {label}: {total} Total Alerts
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ color: '#e11d48' }}>● High:</span>
                        <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'high')?.value}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ color: '#f59e0b' }}>● Medium:</span>
                        <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'medium')?.value}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ color: '#a8a29e' }}>● Low:</span>
                        <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'low')?.value}</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="low" stackId="alerts" fill="#b8b5ab" radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" stackId="alerts" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="high" stackId="alerts" fill="#e11d48" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Bottom Legend matching reference image */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#b8b5ab' }} />
          <span>Low</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
          <span>Medium</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#e11d48' }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
