'use client';

import { useMemo, useState } from 'react';
import { AttackGlobeIcon } from '@/components/ui/CyberIcons';
import { WORLD_LAND_PATH, projectCoordinates } from '@/lib/geo/worldData';
import styles from './AttackSourcesMap.module.css';

export interface AttackCountryItem {
  code: string;
  name?: string;
  country?: string;
  count: number;
  criticalCount?: number;
  share?: number;
  percentage?: number;
  primaryThreat?: string;
}

interface Props {
  data: AttackCountryItem[];
  onSelectCountry?: (country: AttackCountryItem) => void;
}

// Real geographic [lon, lat] coordinates for key global cybersecurity hubs
const HUB_DEFINITIONS: Record<string, { lon: number; lat: number; rings: number; label: string }> = {
  US_WEST: { lon: -122.4, lat: 37.7, rings: 3, label: 'US-West Coast' },
  US_EAST: { lon: -77.0, lat: 38.9, rings: 4, label: 'US-East Coast' },
  SA_BRAZIL: { lon: -46.6, lat: -23.5, rings: 3, label: 'Brazil Hub' },
  EU_WEST: { lon: 2.35, lat: 48.85, rings: 4, label: 'Western Europe' },
  EU_EAST: { lon: 37.6, lat: 55.75, rings: 3, label: 'Eastern Europe / RU' },
  ME_GULF: { lon: 51.4, lat: 25.3, rings: 3, label: 'Middle East Hub' },
  ASIA_SOUTH: { lon: 77.2, lat: 28.6, rings: 3, label: 'South Asia (India)' },
  ASIA_EAST: { lon: 116.4, lat: 39.9, rings: 5, label: 'East Asia Epicenter' },
  ASIA_SE: { lon: 103.8, lat: 1.35, rings: 2, label: 'Southeast Asia' },
  AU_SYDNEY: { lon: 151.2, lat: -33.8, rings: 3, label: 'Australia / Oceania' },
  AFRICA_WEST: { lon: 3.37, lat: 6.52, rings: 2, label: 'West Africa' },
};

// Compute pixel coordinates via cartographic projection
const HUB_COORDINATES: Record<string, { cx: number; cy: number; rings: number; label: string }> = Object.fromEntries(
  Object.entries(HUB_DEFINITIONS).map(([key, hub]) => {
    const [cx, cy] = projectCoordinates(hub.lon, hub.lat);
    return [key, { cx, cy, rings: hub.rings, label: hub.label }];
  })
);

// Major intercontinental cyber attack arcs connecting the hubs (matching reference image)
const INTER_HUB_ARCS = [
  { from: 'ASIA_EAST', to: 'US_EAST', height: -80 },
  { from: 'ASIA_EAST', to: 'US_WEST', height: -65 },
  { from: 'ASIA_EAST', to: 'EU_WEST', height: -60 },
  { from: 'ASIA_EAST', to: 'AU_SYDNEY', height: 40 },
  { from: 'EU_EAST', to: 'US_EAST', height: -70 },
  { from: 'EU_WEST', to: 'SA_BRAZIL', height: -40 },
  { from: 'EU_WEST', to: 'ME_GULF', height: 20 },
  { from: 'US_EAST', to: 'US_WEST', height: 20 },
  { from: 'ME_GULF', to: 'AFRICA_WEST', height: 30 },
  { from: 'SA_BRAZIL', to: 'US_EAST', height: 30 },
  { from: 'ASIA_SOUTH', to: 'EU_WEST', height: -45 },
  { from: 'ASIA_SE', to: 'ASIA_EAST', height: 15 },
  { from: 'AU_SYDNEY', to: 'US_WEST', height: 80 },
];

export default function AttackSourcesMap({ data, onSelectCountry }: Props) {
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);

  const totalAttacks = useMemo(() => data.reduce((acc, c) => acc + c.count, 0), [data]);

  // Ranked Top 5 Attack Origins
  const top5Origins = useMemo(() => {
    return [...data]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <AttackGlobeIcon size={18} color="#ef4444" />
            <h3 className={styles.title}>Attack Sources &amp; Geopolitical Origins</h3>
          </div>
          <p className={styles.subtitle}>
            Cartographic global threat telemetry, multi-ring intrusion epicenters, and intercontinental attack vectors
          </p>
        </div>

        <div className={styles.topRightBadge}>
          <span className={styles.liveDot} />
          <span>{totalAttacks.toLocaleString()} Inbound Intrusion Telemetry Events</span>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className={styles.mapViewport}>
        <svg
          className={styles.worldSvg}
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Authentic Cartographic Natural Earth Landmass (Matching Reference Image 1) */}
          <path
            d={WORLD_LAND_PATH}
            className={styles.landmass}
          />

          {/* Inter-Hub Smooth Curved Attack Arcs (Matching Reference Image 1) */}
          <g className={styles.arcsGroup}>
            {INTER_HUB_ARCS.map((arc, i) => {
              const start = HUB_COORDINATES[arc.from];
              const end = HUB_COORDINATES[arc.to];
              if (!start || !end) return null;

              const midX = (start.cx + end.cx) / 2;
              const midY = (start.cy + end.cy) / 2 + arc.height;
              const isHighlighted = hoveredHub === arc.from || hoveredHub === arc.to;

              return (
                <path
                  key={`arc-${i}`}
                  d={`M ${start.cx},${start.cy} Q ${midX},${midY} ${end.cx},${end.cy}`}
                  className={`${styles.attackArc} ${isHighlighted ? styles.attackArcHovered : ''}`}
                />
              );
            })}
          </g>

          {/* Multi-Ring Concentric Epicenter Circles (Exact match to Reference Image 1) */}
          <g className={styles.epicentersGroup}>
            {Object.entries(HUB_COORDINATES).map(([key, hub]) => {
              const isHovered = hoveredHub === key;

              return (
                <g
                  key={key}
                  className={styles.epicenterNode}
                  onMouseEnter={() => setHoveredHub(key)}
                  onMouseLeave={() => setHoveredHub(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Concentric expanding rings */}
                  {Array.from({ length: hub.rings }, (_, rIdx) => {
                    const radius = (rIdx + 1) * 7.5;
                    return (
                      <circle
                        key={`ring-${key}-${rIdx}`}
                        cx={hub.cx}
                        cy={hub.cy}
                        r={radius}
                        className={styles.epicenterRing}
                        strokeWidth={isHovered ? 1.6 : 1}
                      />
                    );
                  })}

                  {/* Core filled center point */}
                  <circle
                    cx={hub.cx}
                    cy={hub.cy}
                    r={3.5}
                    className={styles.epicenterRingCenter}
                  />

                  {/* Node Label on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={hub.cx - 50}
                        y={hub.cy - (hub.rings * 7.5) - 22}
                        width={100}
                        height={18}
                        rx={4}
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={hub.cx}
                        y={hub.cy - (hub.rings * 7.5) - 10}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="var(--font-mono, monospace)"
                      >
                        {hub.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Bottom Telemetry HUD Dashboard (Exact match to Reference Image 2) */}
      <div className={styles.telemetryHud}>
        {/* Panel 1: Top 5 Attack Origins */}
        <div className={styles.hudCard}>
          <div className={styles.hudHeader}>Top 5 Attack Origins</div>
          <div className={styles.hudBody}>
            {top5Origins.map(c => {
              const share = c.share ?? c.percentage ?? 0;
              const name = c.name || c.country || c.code;
              return (
                <div key={c.code} className={styles.hudRow} onClick={() => onSelectCountry?.(c)} style={{ cursor: 'pointer' }}>
                  <div className={styles.hudLeft}>
                    <span className={styles.hudFlag}>{c.code}</span>
                    <span className={styles.hudName}>{name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.criticalCount !== undefined && (
                      <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '1px 5px', borderRadius: 3 }}>
                        {c.criticalCount} crit
                      </span>
                    )}
                    <span className={styles.hudValue}>{c.count.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({share}%)</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Top Attack Targets */}
        <div className={styles.hudCard}>
          <div className={styles.hudHeader}>Top 5 Defended Targets</div>
          <div className={styles.hudBody}>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Core DB Cluster (PostgreSQL)</span>
              <span className={styles.hudValue} style={{ color: '#ef4444' }}>2,840 Intrusions</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Primary Auth Gateway</span>
              <span className={styles.hudValue} style={{ color: '#f97316' }}>1,920 Intrusions</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Production K8s Worker Node</span>
              <span className={styles.hudValue}>1,450 Intrusions</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Customer Payment Microservice</span>
              <span className={styles.hudValue}>1,180 Intrusions</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Edge Load Balancer (Nginx)</span>
              <span className={styles.hudValue}>860 Intrusions</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Top Attack Types */}
        <div className={styles.hudCard}>
          <div className={styles.hudHeader}>Top Attack Vectors</div>
          <div className={styles.hudBody}>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Ransomware (T1486)</span>
              <span className={styles.hudValue} style={{ color: '#ef4444' }}>2,420 Events</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Zero-Day Exploit (T1190)</span>
              <span className={styles.hudValue} style={{ color: '#ef4444' }}>1,940 Events</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>SQL Injection Probing</span>
              <span className={styles.hudValue} style={{ color: '#f97316' }}>1,680 Events</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>Phishing Token Harvesting</span>
              <span className={styles.hudValue}>1,320 Events</span>
            </div>
            <div className={styles.hudRow}>
              <span className={styles.hudName}>DDoS Ingress Amplification</span>
              <span className={styles.hudValue}>1,090 Events</span>
            </div>
          </div>
        </div>

        {/* Panel 4: Attack Site Statistics */}
        <div className={styles.hudCard}>
          <div className={styles.hudHeader}>Threat Severity Status</div>
          <div className={styles.hudBody}>
            <div className={styles.hudRow}>
              <div className={styles.hudLeft}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />
                <span className={styles.hudName}>Critical (&gt; 100 Attacks/Site)</span>
              </div>
              <span className={styles.hudValue} style={{ color: '#ef4444' }}>5,776</span>
            </div>
            <div className={styles.hudRow}>
              <div className={styles.hudLeft}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} />
                <span className={styles.hudName}>Elevated (50–100 Attacks)</span>
              </div>
              <span className={styles.hudValue} style={{ color: '#f59e0b' }}>2,388</span>
            </div>
            <div className={styles.hudRow}>
              <div className={styles.hudLeft}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6' }} />
                <span className={styles.hudName}>Monitored (&lt; 50 Attacks)</span>
              </div>
              <span className={styles.hudValue}>32.9K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
