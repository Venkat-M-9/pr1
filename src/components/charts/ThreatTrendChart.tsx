'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TimeSeriesThreatPoint } from '@/types/cybersecurity';
import { ShieldAlertIcon } from '@/components/ui/CyberIcons';
import { TrendingUp, BarChart2 } from 'lucide-react';
import styles from './ThreatTrendChart.module.css';

interface Props {
  data24h: TimeSeriesThreatPoint[];
  data7d: TimeSeriesThreatPoint[];
  data30d: TimeSeriesThreatPoint[];
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void;
}

const SERIES_CONFIG = [
  { key: 'critical', label: 'Critical', color: '#dc2626', gradientId: 'grad-critical' },
  { key: 'high', label: 'High', color: '#ea580c', gradientId: 'grad-high' },
  { key: 'medium', label: 'Medium', color: '#d97706', gradientId: 'grad-medium' },
  { key: 'low', label: 'Low', color: '#2563eb', gradientId: 'grad-low' },
];

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function TrendCustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    const totalPoint = payload.reduce((acc, p) => acc + Number(p.value || 0), 0);
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          padding: '10px 14px',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          fontSize: '12px',
          minWidth: 170,
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
          Time: {label} ({totalPoint.toLocaleString()} threats)
        </div>
        {payload.map((p: any) => (
          <div
            key={p.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
            </div>
            <strong style={{ color: 'var(--text)' }}>{Number(p.value).toLocaleString()}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ThreatTrendChart({
  data24h,
  data7d,
  data30d,
  onTimeRangeChange,
}: Props) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  const activeData = timeRange === '24h' ? data24h : timeRange === '7d' ? data7d : data30d;

  const totalThreats = activeData.reduce((acc, p) => acc + p.total, 0);
  const criticalCount = activeData.reduce((acc, p) => acc + p.critical, 0);

  const handleTimeChange = (range: '24h' | '7d' | '30d') => {
    setTimeRange(range);
    onTimeRangeChange?.(range);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ShieldAlertIcon size={18} color="var(--danger)" />
            <h3 className={styles.title}>Threat Trend &amp; Attack Trajectory</h3>
          </div>
          <p className={styles.subtitle}>
            Inbound telemetry time-series classified across 4 severity tiers
          </p>
        </div>

        <div className={styles.controls}>
          {/* 24h / 7d / 30d Aggregation Switcher */}
          <div className={styles.segmentedGroup}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${timeRange === '24h' ? styles.segmentBtnActive : ''}`}
              onClick={() => handleTimeChange('24h')}
            >
              24h (Hourly)
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${timeRange === '7d' ? styles.segmentBtnActive : ''}`}
              onClick={() => handleTimeChange('7d')}
            >
              7d (Daily)
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${timeRange === '30d' ? styles.segmentBtnActive : ''}`}
              onClick={() => handleTimeChange('30d')}
            >
              30d (Weekly)
            </button>
          </div>

          {/* Area / Line Chart View Switcher */}
          <button
            type="button"
            className={`${styles.typeToggleBtn} ${chartType === 'area' ? styles.typeToggleBtnActive : ''}`}
            onClick={() => setChartType(chartType === 'area' ? 'line' : 'area')}
            title={`Switch to ${chartType === 'area' ? 'Line' : 'Area'} chart`}
            aria-label="Toggle chart type"
          >
            {chartType === 'area' ? <TrendingUp size={15} /> : <BarChart2 size={15} />}
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className={styles.summaryRow}>
        <div className={styles.statPill}>
          <span style={{ color: 'var(--text-muted)' }}>Total Threats in Window:</span>
          <strong style={{ color: 'var(--text)', fontWeight: 700 }}>
            {totalThreats.toLocaleString()} events
          </strong>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statDot} style={{ background: '#dc2626' }} />
          <span style={{ color: 'var(--text-muted)' }}>Critical Incidents:</span>
          <strong style={{ color: '#dc2626', fontWeight: 700 }}>
            {criticalCount.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Chart Visualization */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {SERIES_CONFIG.map(s => (
                  <linearGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                dy={6}
              />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} dx={-4} />
              <Tooltip content={<TrendCustomTooltip />} />
              {SERIES_CONFIG.map(s => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${s.gradientId})`}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="timeLabel" stroke="var(--text-muted)" fontSize={11} tickLine={false} dy={6} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} dx={-4} />
              <Tooltip content={<TrendCustomTooltip />} />
              {SERIES_CONFIG.map(s => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: s.color }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {SERIES_CONFIG.map(s => (
          <div key={s.key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: s.color }} />
            <span>{s.label} Severity</span>
          </div>
        ))}
      </div>
    </div>
  );
}
