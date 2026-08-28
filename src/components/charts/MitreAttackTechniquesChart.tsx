'use client';

import { useMemo, useState } from 'react';
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
import { MitreTechniqueItem } from '@/types/cybersecurity';
import { ShieldAlertIcon } from '@/components/ui/CyberIcons';
import { ExternalLink } from 'lucide-react';
import styles from './MitreAttackTechniquesChart.module.css';

interface Props {
  data: MitreTechniqueItem[];
  onSelectTechnique?: (technique: MitreTechniqueItem) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
};

export default function MitreAttackTechniquesChart({ data, onSelectTechnique }: Props) {
  const [selectedTactic, setSelectedTactic] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'bar' | 'matrix'>('bar');
  const [activeTechnique, setActiveTechnique] = useState<MitreTechniqueItem | null>(null);

  // Derive unique tactics
  const tactics = useMemo(() => {
    const set = new Set<string>();
    data.forEach(t => set.add(t.tactic));
    return Array.from(set).sort();
  }, [data]);

  // Overall Stats
  const totalDetections = useMemo(() => data.reduce((acc, t) => acc + t.count, 0), [data]);
  const criticalCount = useMemo(() => data.filter(t => t.severity === 'critical').length, [data]);
  const highCount = useMemo(() => data.filter(t => t.severity === 'high').length, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data
      .filter(item => {
        if (selectedTactic !== 'all' && item.tactic !== selectedTactic) return false;
        if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
        return true;
      })
      .sort((a, b) => b.count - a.count);
  }, [data, selectedTactic, selectedSeverity]);

  // Matrix View grouped by tactic
  const matrixGrouped = useMemo(() => {
    const groups: Record<string, MitreTechniqueItem[]> = {};
    filteredData.forEach(t => {
      if (!groups[t.tactic]) groups[t.tactic] = [];
      groups[t.tactic].push(t);
    });
    return groups;
  }, [filteredData]);

  const handleSelect = (item: MitreTechniqueItem) => {
    setActiveTechnique(item);
    onSelectTechnique?.(item);
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ShieldAlertIcon size={20} color="#ef4444" />
            <h3 className={styles.title}>MITRE ATT&amp;CK® Enterprise Top Techniques</h3>
          </div>
          <p className={styles.subtitle}>
            Adversary Tactics, Techniques, and Common Knowledge · Ranked detections hierarchy &amp; defense strategies
          </p>
        </div>

        {/* Severity KPI Ribbon */}
        <div className={styles.kpiRibbon}>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#ef4444' }} />
            <span>Critical Techniques: {criticalCount}</span>
          </div>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#f97316' }} />
            <span>High Severity: {highCount}</span>
          </div>
          <div className={styles.kpiPill}>
            <span className={styles.kpiDot} style={{ background: '#3b82f6' }} />
            <span>Total Detections: {totalDetections.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Tactic Filter Pills + View Switcher */}
      <div className={styles.controlBar}>
        <div className={styles.tacticPills}>
          <button
            type="button"
            className={`${styles.tacticPill} ${selectedTactic === 'all' ? styles.tacticPillActive : ''}`}
            onClick={() => setSelectedTactic('all')}
          >
            All Tactics ({data.length})
          </button>
          {tactics.map(tactic => {
            const count = data.filter(d => d.tactic === tactic).length;
            return (
              <button
                key={tactic}
                type="button"
                className={`${styles.tacticPill} ${selectedTactic === tactic ? styles.tacticPillActive : ''}`}
                onClick={() => setSelectedTactic(tactic)}
              >
                {tactic} ({count})
              </button>
            );
          })}
        </div>

        <div className={styles.viewModeToggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewMode === 'bar' ? styles.toggleBtnActive : ''}`}
            onClick={() => setViewMode('bar')}
          >
            Ranked Bar
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewMode === 'matrix' ? styles.toggleBtnActive : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            Kill Chain Matrix
          </button>
        </div>
      </div>

      {/* View 1: Horizontal Bar Chart */}
      {viewMode === 'bar' ? (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} opacity={0.4} />
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                label={{
                  value: 'Security Event Detections Count',
                  position: 'insideBottom',
                  offset: -10,
                  fill: 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={({ x, y, payload }) => {
                  const item = filteredData.find(d => d.name === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-10}
                        y={4}
                        textAnchor="end"
                        fill="var(--text)"
                        fontSize="11"
                        fontWeight="600"
                        style={{ cursor: 'pointer' }}
                        onClick={() => item && handleSelect(item)}
                      >
                        {item?.id ? `${item.id}: ` : ''}{payload.value.length > 22 ? `${payload.value.slice(0, 20)}...` : payload.value}
                      </text>
                    </g>
                  );
                }}
                tickLine={{ stroke: 'var(--border)' }}
                axisLine={{ stroke: 'var(--border)' }}
                width={135}
              />
              <Tooltip
                cursor={{ fill: 'var(--surface-hover)', opacity: 0.6 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item: MitreTechniqueItem = payload[0].payload;
                  const share = ((item.count / totalDetections) * 100).toFixed(1);
                  const color = SEVERITY_COLORS[item.severity] || '#3b82f6';

                  return (
                    <div className={styles.tooltipBox}>
                      <div className={styles.tooltipHeader}>
                        <span className={styles.techniqueBadge}>{item.id}</span>
                        <span className={styles.tacticTag}>{item.tactic}</span>
                      </div>
                      <div className={styles.tooltipTitle}>{item.name}</div>
                      <div className={styles.tooltipDesc}>{item.description}</div>
                      <div className={styles.tooltipMetricRow}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Detections</span>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color }}>
                          {item.count.toLocaleString()} ({share}% Share)
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                onClick={(entry: any) => {
                  const payload = entry?.payload || entry;
                  if (payload) handleSelect(payload);
                }}
                style={{ cursor: 'pointer' }}
              >
                {filteredData.map(entry => {
                  const color = SEVERITY_COLORS[entry.severity] || '#3b82f6';
                  const isSelected = activeTechnique?.id === entry.id;
                  return (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={color}
                      fillOpacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* View 2: Kill Chain Matrix Grid */
        <div className={styles.matrixGrid}>
          {Object.entries(matrixGrouped).map(([tacticName, items]) => (
            <div key={tacticName} className={styles.matrixColumn}>
              <div className={styles.matrixColHeader}>
                <span>{tacticName}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {items.reduce((sum, i) => sum + i.count, 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.matrixCardsList}>
                {items.map(tech => {
                  const color = SEVERITY_COLORS[tech.severity] || '#3b82f6';
                  const isSelected = activeTechnique?.id === tech.id;
                  return (
                    <div
                      key={tech.id}
                      className={`${styles.matrixCard} ${isSelected ? styles.matrixCardActive : ''}`}
                      onClick={() => handleSelect(tech)}
                    >
                      <div className={styles.matrixCardTop}>
                        <span className={styles.matrixTechId} style={{ color }}>{tech.id}</span>
                        <span className={styles.matrixTechCount}>{tech.count.toLocaleString()}</span>
                      </div>
                      <span className={styles.matrixTechName}>{tech.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Technique Deep-Dive HUD Card */}
      {activeTechnique && (
        <div className={styles.inspectorBanner}>
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorLeft}>
              <span
                className={styles.techniqueBadge}
                style={{
                  color: SEVERITY_COLORS[activeTechnique.severity],
                  borderColor: SEVERITY_COLORS[activeTechnique.severity],
                }}
              >
                {activeTechnique.id}
              </span>
              <span className={styles.inspectorTitle}>{activeTechnique.name}</span>
              <span className={styles.tacticTag}>• {activeTechnique.tactic}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a
                href={`https://attack.mitre.org/techniques/${activeTechnique.id.replace('.', '/')}`}
                target="_blank"
                rel="noreferrer"
                className={styles.inspectorLink}
              >
                View in MITRE Matrix <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => setActiveTechnique(null)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div className={styles.inspectorGrid}>
            {/* Description */}
            <div className={styles.inspectorSection}>
              <span className={styles.inspectorSectionTitle}>Adversary Behavior Description</span>
              <p className={styles.inspectorText}>{activeTechnique.description}</p>
            </div>

            {/* Known Threat Actors */}
            <div className={styles.inspectorSection}>
              <span className={styles.inspectorSectionTitle}>Observed Threat Actor Groups</span>
              <div className={styles.threatActorsList}>
                {(activeTechnique.threatActors || ['APT28', 'Lazarus Group', 'Volt Typhoon']).map(actor => (
                  <span key={actor} className={styles.actorBadge}>
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            {/* Detection Rules */}
            <div className={styles.inspectorSection}>
              <span className={styles.inspectorSectionTitle}>SIEM &amp; EDR Detection Guidance</span>
              <p className={styles.inspectorText}>
                {activeTechnique.detection || 'Correlate anomalous process invocations and unusual outbound parent-child process chains.'}
              </p>
            </div>

            {/* Mitigation Strategy */}
            <div className={styles.inspectorSection}>
              <span className={styles.inspectorSectionTitle}>Recommended Defensive Countermeasures</span>
              <p className={styles.inspectorText}>
                {activeTechnique.mitigation || 'Enforce principle of least privilege, strict endpoint application control, and continuous posture auditing.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
