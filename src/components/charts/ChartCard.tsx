'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart2, TableProperties } from 'lucide-react';
import styles from './ChartCard.module.css';

interface ChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  categoryKey?: string;
  type: 'line' | 'bar' | 'area' | 'pie';
  height?: number;
}

const MONO_SHADES = ['#0a0a0a', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

export default function ChartCard({
  title,
  subtitle,
  data,
  dataKey,
  categoryKey = 'name',
  type,
  height = 260,
}: ChartProps) {
  // Challenge 4: chart vs table view toggle — users who prefer numbers over visuals can switch
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* View toggle — key for Challenge 4 */}
        <div className={styles.viewToggle} role="group" aria-label="Switch view">
          <button
            className={`${styles.toggleBtn} ${view === 'chart' ? styles.active : ''}`}
            onClick={() => setView('chart')}
            aria-pressed={view === 'chart'}
            title="Chart view"
          >
            <BarChart2 size={12} />
            Chart
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'table' ? styles.active : ''}`}
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
            title="Data table view"
          >
            <TableProperties size={12} />
            Table
          </button>
        </div>
      </div>

      {view === 'table' ? (
        /* ── Data Table View ─────────────────────────────────── */
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>{categoryKey}</th>
                <th style={{ textAlign: 'right' }}>{dataKey}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{String(row[categoryKey] ?? '—')}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {typeof row[dataKey] === 'number'
                      ? row[dataKey].toLocaleString()
                      : String(row[dataKey] ?? '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Chart View ──────────────────────────────────────── */
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <ReLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                <Line type="monotone" dataKey={dataKey} stroke="var(--text)" strokeWidth={2} dot={false} />
              </ReLineChart>
            ) : type === 'bar' ? (
              <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                <Bar dataKey={dataKey} fill="var(--text)" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            ) : type === 'area' ? (
              <ReAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                <Area type="monotone" dataKey={dataKey} stroke="var(--text)" fill="var(--surface-hover)" strokeWidth={2} />
              </ReAreaChart>
            ) : (
              <RePieChart>
                <Pie
                  data={data}
                  dataKey={dataKey}
                  nameKey={categoryKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MONO_SHADES[index % MONO_SHADES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
              </RePieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
