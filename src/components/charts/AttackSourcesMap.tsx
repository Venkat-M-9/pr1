'use client';

import { useMemo, useState } from 'react';
import { AttackGlobeIcon } from '@/components/ui/CyberIcons';
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

// Coordinate anchors for key global cybersecurity hubs on a 1000 x 500 projection
const HUB_COORDINATES: Record<string, { cx: number; cy: number; rings: number; label: string }> = {
  US_WEST: { cx: 165, cy: 155, rings: 3, label: 'US-West' },
  US_EAST: { cx: 270, cy: 160, rings: 4, label: 'US-East' },
  SA_BRAZIL: { cx: 375, cy: 375, rings: 3, label: 'Brazil' },
  EU_WEST: { cx: 520, cy: 135, rings: 4, label: 'W-Europe' },
  EU_EAST: { cx: 585, cy: 120, rings: 3, label: 'E-Europe' },
  ME_GULF: { cx: 625, cy: 200, rings: 3, label: 'Mid-East' },
  ASIA_EAST: { cx: 805, cy: 195, rings: 5, label: 'East Asia' },
  ASIA_SE: { cx: 770, cy: 275, rings: 2, label: 'SE-Asia' },
  AU_SYDNEY: { cx: 875, cy: 415, rings: 3, label: 'Australia' },
  AFRICA_WEST: { cx: 480, cy: 265, rings: 2, label: 'W-Africa' },
};

// Major intercontinental cyber attack arcs connecting the hubs (matching reference image)
const INTER_HUB_ARCS = [
  { from: 'ASIA_EAST', to: 'US_EAST', height: -80 },
  { from: 'ASIA_EAST', to: 'EU_WEST', height: -60 },
  { from: 'ASIA_EAST', to: 'AU_SYDNEY', height: 40 },
  { from: 'EU_EAST', to: 'US_EAST', height: -70 },
  { from: 'EU_WEST', to: 'SA_BRAZIL', height: -40 },
  { from: 'EU_WEST', to: 'ME_GULF', height: 20 },
  { from: 'US_EAST', to: 'US_WEST', height: 20 },
  { from: 'US_WEST', to: 'ASIA_EAST', height: -75 },
  { from: 'ME_GULF', to: 'AFRICA_WEST', height: 30 },
  { from: 'SA_BRAZIL', to: 'US_EAST', height: 30 },
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
            Global threat telemetry, multi-ring intrusion epicenters, and intercontinental attack vectors
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
          {/* Detailed World Continents SVG Paths (Matching Reference Image 1 & 2) */}
          <g className={styles.continentsGroup}>
            {/* North America */}
            <path
              className={styles.landmass}
              d="M 125,60 C 135,55 170,50 200,65 C 230,75 270,60 300,75 C 330,85 350,110 320,135 C 290,155 300,185 285,215 C 275,235 240,245 220,230 C 200,215 160,210 135,175 C 115,150 95,115 110,85 Z"
            />
            {/* Greenland */}
            <path
              className={styles.landmass}
              d="M 330,45 C 355,30 395,35 410,55 C 415,75 390,100 365,95 C 345,90 320,65 330,45 Z"
            />
            {/* South America */}
            <path
              className={styles.landmass}
              d="M 275,245 C 305,240 355,260 385,310 C 405,350 375,410 340,465 C 315,480 295,450 290,390 C 285,340 260,290 275,245 Z"
            />
            {/* Europe */}
            <path
              className={styles.landmass}
              d="M 465,75 C 490,65 540,60 575,85 C 595,105 570,145 540,165 C 510,180 470,165 455,135 C 445,110 450,90 465,75 Z"
            />
            {/* Scandinavia & UK */}
            <path
              className={styles.landmass}
              d="M 445,85 C 455,75 470,75 475,95 C 465,110 445,110 445,85 Z M 495,45 C 520,35 545,45 535,75 C 520,85 490,65 495,45 Z"
            />
            {/* Africa */}
            <path
              className={styles.landmass}
              d="M 455,170 C 495,160 560,165 580,215 C 600,265 585,335 550,395 C 525,430 495,385 475,325 C 455,275 435,215 455,170 Z"
            />
            {/* Madagascar */}
            <path
              className={styles.landmass}
              d="M 605,345 C 615,340 620,365 615,385 C 605,395 595,375 605,345 Z"
            />
            {/* Asia & Russia */}
            <path
              className={styles.landmass}
              d="M 580,65 C 650,45 780,40 885,85 C 935,110 910,165 865,200 C 825,230 805,280 755,285 C 715,280 695,245 665,230 C 635,215 585,185 580,145 Z"
            />
            {/* Indian Subcontinent */}
            <path
              className={styles.landmass}
              d="M 660,205 C 695,200 735,225 725,275 C 705,300 675,300 660,255 Z"
            />
            {/* Japan & Korean Peninsula */}
            <path
              className={styles.landmass}
              d="M 865,145 C 885,140 895,175 885,205 C 875,215 860,185 865,145 Z"
            />
            {/* Southeast Asia & Indonesia */}
            <path
              className={styles.landmass}
              d="M 755,275 C 785,270 825,290 815,325 C 795,345 765,335 755,305 Z M 835,315 C 865,315 875,345 845,355 Z"
            />
            {/* Australia */}
            <path
              className={styles.landmass}
              d="M 815,365 C 865,345 925,355 935,405 C 925,445 875,465 835,445 C 805,425 795,385 815,365 Z"
            />
            {/* New Zealand */}
            <path
              className={styles.landmass}
              d="M 945,435 C 965,430 970,455 955,475 C 945,480 935,455 945,435 Z"
            />
          </g>

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
                        strokeWidth={isHovered ? 1.5 : 1}
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

                  {/* Node Label */}
                  {isHovered && (
                    <text
                      x={hub.cx}
                      y={hub.cy - (hub.rings * 7.5) - 6}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="var(--font-mono, monospace)"
                    >
                      {hub.label}
                    </text>
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
                  <span className={styles.hudValue}>{c.count.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({share}%)</span></span>
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
