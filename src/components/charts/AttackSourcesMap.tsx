'use client';

import { useMemo, useState } from 'react';
import { AttackGlobeIcon, ShieldAlertIcon } from '@/components/ui/CyberIcons';
import styles from './AttackSourcesMap.module.css';

export interface AttackCountryItem {
  code: string;
  name?: string;
  country?: string;
  count: number;
  share?: number;
  percentage?: number;
  primaryThreat?: string;
}

interface Props {
  data: AttackCountryItem[];
  onSelectCountry?: (country: AttackCountryItem) => void;
}

// Coordinate mapping on 1000 x 500 panoramic cylindrical projection
const COUNTRY_COORDS: Record<string, { cx: number; cy: number }> = {
  US: { cx: 230, cy: 190 },
  CN: { cx: 770, cy: 210 },
  RU: { cx: 710, cy: 140 },
  BR: { cx: 340, cy: 340 },
  DE: { cx: 520, cy: 160 },
  IN: { cx: 680, cy: 245 },
  NL: { cx: 505, cy: 145 },
  GB: { cx: 485, cy: 140 },
  SG: { cx: 755, cy: 295 },
  VN: { cx: 765, cy: 255 },
  IR: { cx: 610, cy: 210 },
  KP: { cx: 825, cy: 195 },
  UA: { cx: 570, cy: 155 },
};

// Enterprise Target Datacenter coordinate
const DEFENDED_TARGET = { cx: 230, cy: 190, label: 'US-East Core DC' };

const getHeatColor = (share: number, primaryThreat?: string) => {
  if (primaryThreat?.toLowerCase().includes('ransomware') || share >= 20) return '#ef4444';
  if (primaryThreat?.toLowerCase().includes('zero-day') || share >= 15) return '#f43f5e';
  if (primaryThreat?.toLowerCase().includes('sql') || share >= 8) return '#f97316';
  if (primaryThreat?.toLowerCase().includes('ddos') || share >= 5) return '#f59e0b';
  return '#3b82f6';
};

export default function AttackSourcesMap({ data, onSelectCountry }: Props) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'exploits'>('all');

  const totalAttacks = useMemo(() => data.reduce((acc, c) => acc + c.count, 0), [data]);

  const filteredData = useMemo(() => {
    if (filterMode === 'critical') {
      return data.filter(c => (c.share ?? c.percentage ?? 0) >= 10 || c.primaryThreat?.includes('Ransomware') || c.primaryThreat?.includes('Zero-Day'));
    }
    if (filterMode === 'exploits') {
      return data.filter(c => c.primaryThreat?.includes('Exploit') || c.primaryThreat?.includes('SQL') || c.primaryThreat?.includes('Credential'));
    }
    return data;
  }, [data, filterMode]);

  const hoveredCountry = useMemo(() => data.find(c => c.code === hoveredCode), [data, hoveredCode]);

  return (
    <div className={styles.card}>
      {/* Header with Title and Telemetry Stats */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <AttackGlobeIcon size={20} color="#ef4444" />
            <h3 className={styles.title}>Attack Sources &amp; Geopolitical Telemetry</h3>
          </div>
          <p className={styles.subtitle}>
            Global intrusion origins, ballistic attack trajectories, and aggregated threat telemetry
          </p>
        </div>

        <div className={styles.kpiRibbon}>
          <div className={styles.kpiBox}>
            <span className={styles.kpiLabel}>Total Inbound</span>
            <span className={styles.kpiValue} style={{ color: '#ef4444' }}>
              {totalAttacks.toLocaleString()}
            </span>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiLabel}>Origin Regions</span>
            <span className={styles.kpiValue}>{data.length} Jurisdictions</span>
          </div>
          <div className={styles.kpiBox}>
            <span className={styles.kpiLabel}>Defended Target</span>
            <span className={styles.kpiValue} style={{ color: '#10b981' }}>{DEFENDED_TARGET.label}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Panoramic World Map, Right Ranked Telemetry Feed */}
      <div className={styles.mainLayout}>
        {/* Panoramic Cyber World Map Canvas */}
        <div className={styles.mapViewport}>
          <svg
            className={styles.worldSvg}
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Target Datacenter Radial Glow */}
              <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              {/* Origin Threat Radial Glow */}
              <radialGradient id="threatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Latitude & Longitude Coordinate Cyber Grid */}
            {[100, 200, 300, 400].map(y => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="var(--border)" strokeDasharray="3 3" opacity={0.35} />
            ))}
            {[150, 300, 450, 600, 750, 900].map(x => (
              <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="500" stroke="var(--border)" strokeDasharray="3 3" opacity={0.35} />
            ))}

            {/* High-Fidelity World Continents Vector Outlines */}
            {/* North America */}
            <path
              d="M 120 100 Q 200 60, 300 90 T 360 170 T 280 250 T 200 210 T 130 150 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1.2}
              opacity={0.85}
            />
            {/* South America */}
            <path
              d="M 290 260 Q 380 280, 350 380 T 310 460 T 270 350 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1.2}
              opacity={0.85}
            />
            {/* Europe */}
            <path
              d="M 470 90 Q 570 70, 580 140 T 540 190 T 460 150 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1.2}
              opacity={0.85}
            />
            {/* Africa */}
            <path
              d="M 470 200 Q 570 200, 590 290 T 540 420 T 460 300 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1.2}
              opacity={0.85}
            />
            {/* Asia & Russia */}
            <path
              d="M 600 80 Q 820 50, 910 140 T 850 270 T 640 220 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1.2}
              opacity={0.85}
            />
            {/* Australia / Oceania */}
            <path
              d="M 780 330 Q 880 320, 890 400 T 790 430 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1.2}
              opacity={0.85}
            />

            {/* Ballistic Curved Attack Trajectories toward Defended Enterprise Target */}
            {filteredData.map(country => {
              if (country.code === 'US') return null; // Source is local target region
              const origin = COUNTRY_COORDS[country.code];
              if (!origin) return null;

              const share = country.share ?? country.percentage ?? 0;
              const color = getHeatColor(share, country.primaryThreat);
              const isHovered = hoveredCode === country.code;

              // Compute curved control point for ballistic cyber trajectory
              const midX = (origin.cx + DEFENDED_TARGET.cx) / 2;
              const midY = Math.min(origin.cy, DEFENDED_TARGET.cy) - 60;

              return (
                <g key={`traj-${country.code}`}>
                  {/* Glowing trajectory backdrop arc */}
                  <path
                    d={`M ${origin.cx} ${origin.cy} Q ${midX} ${midY} ${DEFENDED_TARGET.cx} ${DEFENDED_TARGET.cy}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : 1.2}
                    opacity={isHovered ? 0.9 : 0.35}
                    className={styles.attackArc}
                  />
                </g>
              );
            })}

            {/* Defended Enterprise Datacenter Target Marker */}
            <g>
              <circle
                cx={DEFENDED_TARGET.cx}
                cy={DEFENDED_TARGET.cy}
                r={24}
                fill="url(#targetGlow)"
              />
              <circle
                cx={DEFENDED_TARGET.cx}
                cy={DEFENDED_TARGET.cy}
                r={8}
                fill="#10b981"
                stroke="var(--surface)"
                strokeWidth={2}
              />
              <text
                x={DEFENDED_TARGET.cx}
                y={DEFENDED_TARGET.cy + 22}
                fill="#10b981"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--font-mono, monospace)"
              >
                ● {DEFENDED_TARGET.label}
              </text>
            </g>

            {/* Origin Hotspots & Pulsating Threat Rings */}
            {filteredData.map(country => {
              const coords = COUNTRY_COORDS[country.code] || { cx: 500, cy: 250 };
              const share = country.share ?? country.percentage ?? 0;
              const color = getHeatColor(share, country.primaryThreat);
              const radius = Math.max(6, Math.min(18, Math.round(share * 0.7 + 5)));
              const isHovered = hoveredCode === country.code;

              return (
                <g
                  key={country.code}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredCode(country.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  onClick={() => onSelectCountry?.(country)}
                >
                  {/* Radar pulse wave */}
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    className={styles.radarPulse}
                  />
                  {/* Threat Node Core */}
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={radius}
                    fill={color}
                    stroke="var(--surface)"
                    strokeWidth={2}
                    opacity={isHovered ? 1 : 0.85}
                  />
                  {/* ISO Country Label */}
                  <text
                    x={coords.cx}
                    y={coords.cy - radius - 4}
                    fill="var(--text)"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="var(--font-mono, monospace)"
                  >
                    {country.code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Side: Interactive Telemetry Feed & Filter Hub */}
        <div className={styles.sideTelemetry}>
          {/* Quick Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterMode === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All Origins ({data.length})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterMode === 'critical' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('critical')}
            >
              Critical Threat
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filterMode === 'exploits' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterMode('exploits')}
            >
              Exploits / CVE
            </button>
          </div>

          {/* Active Hover Detail HUD (if hovered) */}
          {hoveredCountry && (
            <div
              style={{
                padding: '10px 12px',
                background: 'var(--bg)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  {hoveredCountry.name || hoveredCountry.country} ({hoveredCountry.code})
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Primary Vector: <strong style={{ color: getHeatColor(hoveredCountry.share ?? hoveredCountry.percentage ?? 0, hoveredCountry.primaryThreat) }}>{hoveredCountry.primaryThreat}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono, monospace)' }}>
                  {hoveredCountry.count.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {hoveredCountry.share ?? hoveredCountry.percentage}% Traffic Share
                </div>
              </div>
            </div>
          )}

          {/* Ranked Country Scroll List */}
          <div className={styles.countryScrollList}>
            {filteredData.map(country => {
              const isHovered = hoveredCode === country.code;
              const share = country.share ?? country.percentage ?? 0;
              const color = getHeatColor(share, country.primaryThreat);
              const displayName = country.name || country.country || country.code;

              return (
                <div
                  key={country.code}
                  className={`${styles.countryCard} ${isHovered ? styles.countryCardActive : ''}`}
                  onMouseEnter={() => setHoveredCode(country.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  onClick={() => onSelectCountry?.(country)}
                >
                  <div className={styles.countryInfo}>
                    <span className={styles.isoBadge}>{country.code}</span>
                    <div className={styles.countryDetails}>
                      <span className={styles.countryName}>{displayName}</span>
                      <span className={styles.countryThreat}>{country.primaryThreat || 'Inbound Probe'}</span>
                    </div>
                  </div>

                  <div className={styles.countryMetrics}>
                    <span className={styles.countText}>{country.count.toLocaleString()}</span>
                    <div className={styles.progressBarTrack}>
                      <div
                        className={styles.progressBarFill}
                        style={{
                          width: `${Math.min(100, share * 3.5)}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
