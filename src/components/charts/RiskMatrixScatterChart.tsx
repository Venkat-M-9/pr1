'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { SecurityAsset } from '@/types/cybersecurity';
import { ShieldAlertIcon } from '@/components/ui/CyberIcons';
import styles from './RiskMatrixScatterChart.module.css';

interface Props {
  data: SecurityAsset[];
  onSelectAsset?: (asset: SecurityAsset) => void;
}

export function getRiskColor(score: number): string {
  if (score >= 75) return '#ef4444'; // Critical
  if (score >= 50) return '#f97316'; // High
  if (score >= 30) return '#f59e0b'; // Medium
  return '#10b981'; // Low
}

export function getRiskTierLabel(score: number): string {
  if (score >= 75) return 'Critical Risk';
  if (score >= 50) return 'High Exposure';
  if (score >= 30) return 'Medium Risk';
  return 'Low Risk';
}

export default function RiskMatrixScatterChart({ data, onSelectAsset }: Props) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [activeAsset, setActiveAsset] = useState<SecurityAsset | null>(null);

  // Derive unique asset types for filter dropdown
  const assetTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach(a => types.add(a.type));
    return Array.from(types).sort();
  }, [data]);

  // Quadrant KPI breakdown
  const kpiStats = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    data.forEach(a => {
      if (a.riskScore >= 75) critical++;
      else if (a.riskScore >= 50) high++;
      else if (a.riskScore >= 30) medium++;
      else low++;
    });

    return { critical, high, medium, low };
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(asset => {
      if (selectedType !== 'all' && asset.type !== selectedType) return false;
      if (selectedQuadrant === 'q1' && !(asset.likelihood >= 50 && asset.impact >= 50)) return false;
      if (selectedQuadrant === 'q2' && !(asset.likelihood < 50 && asset.impact >= 50)) return false;
      if (selectedQuadrant === 'q3' && !(asset.likelihood < 50 && asset.impact < 50)) return false;
      if (selectedQuadrant === 'q4' && !(asset.likelihood >= 50 && asset.impact < 50)) return false;
      return true;
    });
  }, [data, selectedType, selectedQuadrant]);

  const handlePointClick = (entry: any) => {
    const payload: SecurityAsset = entry?.payload || entry;
    if (payload) {
      setActiveAsset(payload);
      onSelectAsset?.(payload);
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ShieldAlertIcon size={20} color="#f97316" />
            <h3 className={styles.title}>Asset Risk Matrix (Likelihood vs. Impact)</h3>
          </div>
          <p className={styles.subtitle}>
            NIST SP 800-30 &amp; FAIR Quantitative Risk Model · Bubble size represents vulnerability count
          </p>
        </div>

        {/* Severity Tier KPI Ribbon */}
        <div className={styles.kpiRibbon}>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#ef4444' }} />
            <span>Critical: {kpiStats.critical}</span>
          </div>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#f97316' }} />
            <span>High: {kpiStats.high}</span>
          </div>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#f59e0b' }} />
            <span>Medium: {kpiStats.medium}</span>
          </div>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#10b981' }} />
            <span>Low: {kpiStats.low}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Asset Category:</span>
          <select
            className={styles.selectInput}
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="all">All Asset Types ({data.length})</option>
            {assetTypes.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Risk Quadrant:</span>
          <select
            className={styles.selectInput}
            value={selectedQuadrant}
            onChange={e => setSelectedQuadrant(e.target.value)}
          >
            <option value="all">All Quadrants</option>
            <option value="q1">Q1: Critical Risk (Likelihood ≥50 &amp; Impact ≥50)</option>
            <option value="q2">Q2: High Impact Catastrophic (Likelihood &lt;50 &amp; Impact ≥50)</option>
            <option value="q4">Q4: Operational Friction (Likelihood ≥50 &amp; Impact &lt;50)</option>
            <option value="q3">Q3: Low Risk Zone (Likelihood &lt;50 &amp; Impact &lt;50)</option>
          </select>
        </div>
      </div>

      {/* Main Scatter Chart with Quadrant Overlays */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />

            {/* Quadrant Visual Areas */}
            {/* Q1: Critical Zone (Top-Right) */}
            <ReferenceArea
              x1={50}
              x2={100}
              y1={50}
              y2={100}
              fill="#ef4444"
              fillOpacity={0.06}
            />
            {/* Q2: Catastrophic / High Impact (Top-Left) */}
            <ReferenceArea
              x1={0}
              x2={50}
              y1={50}
              y2={100}
              fill="#f97316"
              fillOpacity={0.04}
            />
            {/* Q4: Frequent Probing / Operational (Bottom-Right) */}
            <ReferenceArea
              x1={50}
              x2={100}
              y1={0}
              y2={50}
              fill="#f59e0b"
              fillOpacity={0.04}
            />
            {/* Q3: Low Risk (Bottom-Left) */}
            <ReferenceArea
              x1={0}
              x2={50}
              y1={0}
              y2={50}
              fill="#10b981"
              fillOpacity={0.04}
            />

            {/* Crosshair 50% Threshold Reference Lines */}
            <ReferenceLine x={50} stroke="var(--border-strong)" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="var(--border-strong)" strokeDasharray="4 4" />

            <XAxis
              type="number"
              dataKey="likelihood"
              name="Likelihood"
              unit="%"
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border)' }}
              axisLine={{ stroke: 'var(--border)' }}
              label={{
                value: 'Threat Exploitation Likelihood (0 - 100%)',
                position: 'insideBottom',
                offset: -15,
                fill: 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <YAxis
              type="number"
              dataKey="impact"
              name="Impact"
              unit="%"
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border)' }}
              axisLine={{ stroke: 'var(--border)' }}
              label={{
                value: 'Business Impact (0 - 100%)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <ZAxis
              type="number"
              dataKey="vulnerabilityCount"
              range={[120, 650]}
              name="Vulnerabilities"
            />

            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'var(--border-strong)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const asset: SecurityAsset = payload[0].payload;
                const color = getRiskColor(asset.riskScore);

                return (
                  <div className={styles.tooltipBox}>
                    <div className={styles.tooltipHeader}>
                      <span className={styles.tooltipTitle}>{asset.name}</span>
                      <span className={styles.tooltipType}>{asset.type}</span>
                    </div>

                    <div className={styles.tooltipGrid}>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipItemLabel}>Likelihood</span>
                        <span className={styles.tooltipItemValue}>{asset.likelihood}%</span>
                      </div>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipItemLabel}>Impact</span>
                        <span className={styles.tooltipItemValue}>{asset.impact}%</span>
                      </div>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipItemLabel}>FAIR Risk Score</span>
                        <span className={styles.tooltipItemValue} style={{ color }}>
                          {asset.riskScore}/100
                        </span>
                      </div>
                      <div className={styles.tooltipItem}>
                        <span className={styles.tooltipItemLabel}>Vulnerabilities</span>
                        <span className={styles.tooltipItemValue}>
                          {asset.vulnerabilityCount} ({asset.criticalVulnerabilities} Critical)
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      IP: <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{asset.ip}</span> · {asset.department}
                    </div>
                  </div>
                );
              }}
            />

            <Scatter
              name="Security Assets"
              data={filteredData}
              onClick={handlePointClick}
              style={{ cursor: 'pointer' }}
            >
              {filteredData.map((entry) => {
                const color = getRiskColor(entry.riskScore);
                const isSelected = activeAsset?.id === entry.id;

                return (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={color}
                    stroke={isSelected ? '#ffffff' : color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    fillOpacity={isSelected ? 0.95 : 0.75}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Asset Inspection HUD Banner */}
      {activeAsset && (
        <div className={styles.inspectorBanner}>
          <div className={styles.inspectorLeft}>
            <div
              className={styles.inspectorScoreBadge}
              style={{
                borderColor: getRiskColor(activeAsset.riskScore),
                color: getRiskColor(activeAsset.riskScore),
              }}
            >
              <span className={styles.inspectorScoreNum}>{activeAsset.riskScore}</span>
              <span className={styles.inspectorScoreLabel}>FAIR</span>
            </div>

            <div className={styles.inspectorDetails}>
              <div className={styles.inspectorName}>
                {activeAsset.name}{' '}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: getRiskColor(activeAsset.riskScore),
                  }}
                >
                  ({getRiskTierLabel(activeAsset.riskScore)})
                </span>
              </div>
              <div className={styles.inspectorMeta}>
                <span>{activeAsset.type}</span>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{activeAsset.ip}</span>
                <span>•</span>
                <span>{activeAsset.department}</span>
              </div>
            </div>
          </div>

          <div className={styles.inspectorRight}>
            <div className={styles.inspectorMetric}>
              <span className={styles.inspectorMetricLabel}>Likelihood / Impact</span>
              <span className={styles.inspectorMetricVal}>
                {activeAsset.likelihood}% / {activeAsset.impact}%
              </span>
            </div>
            <div className={styles.inspectorMetric}>
              <span className={styles.inspectorMetricLabel}>Vulnerability Density</span>
              <span className={styles.inspectorMetricVal} style={{ color: activeAsset.criticalVulnerabilities > 0 ? '#ef4444' : 'var(--text)' }}>
                {activeAsset.vulnerabilityCount} Total ({activeAsset.criticalVulnerabilities} Critical)
              </span>
            </div>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setActiveAsset(null)}
            >
              Close HUD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
