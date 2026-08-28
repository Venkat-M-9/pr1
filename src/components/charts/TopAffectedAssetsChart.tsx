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
import { ServerClusterIcon } from '@/components/ui/CyberIcons';
import styles from './TopAffectedAssetsChart.module.css';

export interface AffectedAssetItem {
  id: string;
  name: string;
  type: string;
  ip: string;
  department: string;
  securityEvents: number;
  vulnerabilityCount: number;
  criticalVulnerabilities: number;
  riskScore: number;
  status: string;
}

interface Props {
  data: AffectedAssetItem[];
  onSelectAsset?: (asset: AffectedAssetItem) => void;
}

const getAssetColor = (riskScore: number) => {
  if (riskScore >= 75) return '#ef4444';
  if (riskScore >= 50) return '#f97316';
  if (riskScore >= 25) return '#f59e0b';
  return '#3b82f6';
};

import { useState } from 'react';

export default function TopAffectedAssetsChart({ data, onSelectAsset }: Props) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Sort descending by security events and cap at Top 10
  const sortedData = [...data]
    .sort((a, b) => b.securityEvents - a.securityEvents)
    .slice(0, 10);

  const handleBarClick = (item: any) => {
    const payload = item?.payload || item;
    if (payload) {
      setSelectedAssetId(payload.id);
      onSelectAsset?.(payload);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ServerClusterIcon size={18} color="#f97316" />
            <h3 className={styles.title}>Top 10 Affected Infrastructure Assets</h3>
          </div>
          <p className={styles.subtitle}>
            Critical systems ranked by total security event volume and threat index
          </p>
        </div>
        <span className={styles.badge}>Top 10 Targets</span>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.6} />
            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              width={180}
              tick={({ x, y, payload }) => {
                const text = payload.value.length > 22 ? `${payload.value.slice(0, 20)}…` : payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-10}
                      y={4}
                      textAnchor="end"
                      fill="var(--text)"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {text}
                    </text>
                  </g>
                );
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as AffectedAssetItem;
                  const color = getAssetColor(d.riskScore);
                  return (
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-strong)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)',
                        fontSize: '12px',
                        minWidth: 200,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <strong style={{ color: 'var(--text)' }}>{d.name}</strong>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '3px',
                            background: `${color}18`,
                            color,
                          }}
                        >
                          Risk: {d.riskScore}/100
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 6 }}>
                        {d.id} · {d.type} · IP: {d.ip}
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div>
                          Security Events: <strong style={{ color: 'var(--text)' }}>{d.securityEvents.toLocaleString()}</strong>
                        </div>
                        <div>
                          Vulnerabilities: <strong style={{ color: 'var(--text)' }}>{d.vulnerabilityCount}</strong> (Critical: <strong style={{ color: '#ef4444' }}>{d.criticalVulnerabilities}</strong>)
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                          Owner: {d.department}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="securityEvents"
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {sortedData.map((entry, index) => {
                const color = getAssetColor(entry.riskScore);
                const isSelected = selectedAssetId === entry.id;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={selectedAssetId && !isSelected ? 0.45 : 1}
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
