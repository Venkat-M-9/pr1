'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { SecurityPostureDimension } from '@/types/cybersecurity';
import { ShieldCheckIcon } from '@/components/ui/CyberIcons';
import styles from './SecurityPostureSpiderChart.module.css';

interface Props {
  data: SecurityPostureDimension[];
  onSelectDimension?: (dimension: SecurityPostureDimension) => void;
}

export default function SecurityPostureSpiderChart({ data, onSelectDimension }: Props) {
  const [selectedAxis, setSelectedAxis] = useState<string | null>(null);

  // Overall Score Calculations
  const overallCurrent = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(data.reduce((acc, d) => acc + d.current, 0) / data.length);
  }, [data]);

  const overallBenchmark = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(data.reduce((acc, d) => acc + d.benchmark, 0) / data.length);
  }, [data]);

  const delta = overallCurrent - overallBenchmark;

  const maxMark = useMemo(() => {
    if (!data.length) return 100;
    return Math.max(...data.map(d => d.fullMark || 100), 100);
  }, [data]);

  const handleSelect = (dim: SecurityPostureDimension) => {
    setSelectedAxis(dim.axis);
    onSelectDimension?.(dim);
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <ShieldCheckIcon size={20} color="#0ea5e9" />
            <h3 className={styles.title}>Enterprise Security Posture (7-Axis Radar)</h3>
          </div>
          <p className={styles.subtitle}>
            Continuous CIS &amp; NIST CSF 2.0 Assessment · Organization Score vs. Industry Peer Benchmark
          </p>
        </div>

        {/* Overall Posture KPI Badge */}
        <div className={styles.kpiRibbon}>
          <div className={styles.overallScoreBox}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.overallScoreLabel}>Posture Index</span>
              <span className={styles.overallScoreNum}>{overallCurrent}/100</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span className={`${styles.deltaBadge} ${delta < 0 ? styles.deltaBadgeNegative : ''}`}>
                {delta >= 0 ? `+${delta}` : delta} vs Peer
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Benchmark: {overallBenchmark}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className={styles.mainLayout}>
        {/* Left: 7-Axis Spider Radar Chart Canvas */}
        <div className={styles.radarViewport}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
              <PolarGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.6} />
              <PolarAngleAxis
                dataKey="axis"
                tick={({ x, y, payload }) => {
                  const isSelected = selectedAxis === payload.value;
                  const item = data.find(d => d.axis === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        fill={isSelected ? '#0ea5e9' : 'var(--text)'}
                        fontSize={11}
                        fontWeight={isSelected ? 800 : 600}
                        style={{ cursor: 'pointer' }}
                        onClick={() => item && handleSelect(item)}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, maxMark]}
                stroke="var(--border)"
                tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item: SecurityPostureDimension = payload[0].payload;
                  const dimDelta = item.current - item.benchmark;

                  return (
                    <div className={styles.tooltipBox}>
                      <div className={styles.tooltipTitle}>{item.axis}</div>
                      <div className={styles.tooltipRow}>
                        <span style={{ color: 'var(--text-muted)' }}>Organization Score</span>
                        <span style={{ fontWeight: 700, color: '#0ea5e9', fontFamily: 'var(--font-mono, monospace)' }}>
                          {item.current}/100
                        </span>
                      </div>
                      <div className={styles.tooltipRow}>
                        <span style={{ color: 'var(--text-muted)' }}>Industry Benchmark</span>
                        <span style={{ fontWeight: 700, color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
                          {item.benchmark}/100
                        </span>
                      </div>
                      <div className={styles.tooltipRow}>
                        <span style={{ color: 'var(--text-muted)' }}>Posture Gap</span>
                        <span style={{ fontWeight: 700, color: dimDelta >= 0 ? '#10b981' : '#ef4444' }}>
                          {dimDelta >= 0 ? `+${dimDelta}` : dimDelta} pts
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>
                        {item.description}
                      </div>
                    </div>
                  );
                }}
              />

              {/* Organization Score Radar */}
              <Radar
                name="Org Current Score"
                dataKey="current"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.4}
                strokeWidth={2}
              />

              {/* Industry Benchmark Radar */}
              <Radar
                name="Industry Benchmark"
                dataKey="benchmark"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.15}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: 7-Dimension Scorecards & Recommendations */}
        <div className={styles.dimensionCardsList}>
          {data.map(dim => {
            const dimDelta = dim.current - dim.benchmark;
            const isSelected = selectedAxis === dim.axis;
            const barColor = dim.current >= 80 ? '#10b981' : dim.current >= 70 ? '#0ea5e9' : '#f97316';

            return (
              <div
                key={dim.axis}
                className={`${styles.dimensionCard} ${isSelected ? styles.dimensionCardActive : ''}`}
                onClick={() => handleSelect(dim)}
              >
                <div className={styles.dimensionCardHeader}>
                  <span className={styles.dimensionName}>{dim.axis}</span>
                  <div className={styles.dimensionScores}>
                    <span style={{ fontWeight: 800, color: barColor }}>{dim.current}</span>
                    <span style={{ color: 'var(--text-muted)' }}>/ {dim.benchmark} BM</span>
                    <span className={`${styles.deltaBadge} ${dimDelta < 0 ? styles.deltaBadgeNegative : ''}`}>
                      {dimDelta >= 0 ? `+${dimDelta}` : dimDelta}
                    </span>
                  </div>
                </div>

                {/* Progress bar track with benchmark line */}
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${dim.current}%`, background: barColor }}
                  />
                  <div
                    className={styles.benchmarkMarker}
                    style={{ left: `${dim.benchmark}%` }}
                    title={`Industry Benchmark: ${dim.benchmark}`}
                  />
                </div>

                {/* Recommendation Guidance */}
                <div className={styles.dimensionRecommendation}>
                  <strong>Guidance:</strong> {dim.recommendation || dim.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
