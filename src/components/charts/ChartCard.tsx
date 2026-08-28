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

interface StackedKey {
  key: string;
  color: string;
  label: string;
}

interface ChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  categoryKey?: string;
  type: 'line' | 'bar' | 'area' | 'pie';
  stackedKeys?: StackedKey[];
  height?: number;
}

const CYBER_PALETTE = ['#dc2626', '#ea580c', '#d97706', '#2563eb', '#10b981', '#64748b'];

export default function ChartCard({
  title,
  subtitle,
  data,
  dataKey,
  categoryKey = 'name',
  type,
  stackedKeys,
  height = 240,
}: ChartProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* View toggle — Challenge 4 */}
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
        <div style={{ width: '100%', height: height + (stackedKeys ? 30 : 0) }}>
          <ResponsiveContainer width="100%" height={height}>
            {type === 'line' ? (
              <ReLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                <Line type="monotone" dataKey={dataKey} stroke="#c5221f" strokeWidth={2} dot={false} />
              </ReLineChart>
            ) : type === 'bar' && stackedKeys ? (
              /* Stacked Bar Chart matching Image 2 */
              <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                {stackedKeys.map(s => (
                  <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} radius={[0, 0, 0, 0]} />
                ))}
              </ReBarChart>
            ) : type === 'bar' ? (
              <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                <Bar dataKey={dataKey} fill="#b06000" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            ) : type === 'area' ? (
              <ReAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey={categoryKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
                <Area type="monotone" dataKey={dataKey} stroke="#c5221f" fill="rgba(197, 34, 31, 0.1)" strokeWidth={2} />
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
                  paddingAngle={3}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CYBER_PALETTE[index % CYBER_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                />
              </RePieChart>
            )}
          </ResponsiveContainer>

          {/* Stacked Chart Legend matching Image 2 */}
          {type === 'bar' && stackedKeys && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              {stackedKeys.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
