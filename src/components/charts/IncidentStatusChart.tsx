'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ShieldAlertIcon } from '@/components/ui/CyberIcons';
import { IncidentTimelinePoint } from '@/types/cybersecurity';
import styles from './IncidentStatusChart.module.css';

interface Props {
  data: IncidentTimelinePoint[];
  summary?: {
    total: number;
    open: number;
    investigating: number;
    contained: number;
    resolved: number;
  };
}

export default function IncidentStatusChart({ data, summary }: Props) {
  const totals = summary || {
    total: data.reduce((acc, d) => acc + d.open + d.investigating + d.contained + d.resolved, 0),
    open: data[data.length - 1]?.open ?? 3,
    investigating: data[data.length - 1]?.investigating ?? 5,
    contained: data[data.length - 1]?.contained ?? 8,
    resolved: data[data.length - 1]?.resolved ?? 18,
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ShieldAlertIcon size={18} color="#ef4444" />
            <h3 className={styles.title}>Incident Lifecycle &amp; Resolution Status</h3>
          </div>
          <p className={styles.subtitle}>
            Progression of security incidents across triage, investigation, containment, and resolution
          </p>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span className={styles.dot} style={{ background: '#ef4444' }} />
            <span>Open: {totals.open}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.dot} style={{ background: '#f97316' }} />
            <span>Investigating: {totals.investigating}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.dot} style={{ background: '#3b82f6' }} />
            <span>Contained: {totals.contained}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.dot} style={{ background: '#10b981' }} />
            <span>Resolved: {totals.resolved}</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.6} />
            <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const total = payload.reduce((acc, p) => acc + Number(p.value || 0), 0);
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
                        {label} ({total} Incidents)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#ef4444' }}>● Open:</span>
                          <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'open')?.value}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#f97316' }}>● Investigating:</span>
                          <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'investigating')?.value}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#3b82f6' }}>● Contained:</span>
                          <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'contained')?.value}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#10b981' }}>● Resolved:</span>
                          <strong style={{ color: 'var(--text)' }}>{payload.find(p => p.dataKey === 'resolved')?.value}</strong>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 8 }}
            />
            <Bar dataKey="resolved" name="Resolved" stackId="incidents" fill="#10b981" />
            <Bar dataKey="contained" name="Contained" stackId="incidents" fill="#3b82f6" />
            <Bar dataKey="investigating" name="Investigating" stackId="incidents" fill="#f97316" />
            <Bar dataKey="open" name="Open" stackId="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
