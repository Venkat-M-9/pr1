'use client';

import { useState } from 'react';
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

// Coordinates mapping for key countries on a simplified cylindrical world projection (viewBox 0 0 800 400)
const COUNTRY_COORDS: Record<string, { cx: number; cy: number }> = {
  RU: { cx: 560, cy: 110 },
  CN: { cx: 620, cy: 160 },
  US: { cx: 210, cy: 150 },
  IR: { cx: 485, cy: 165 },
  KP: { cx: 665, cy: 150 },
  BR: { cx: 280, cy: 260 },
  VN: { cx: 615, cy: 200 },
  IN: { cx: 540, cy: 190 },
  UA: { cx: 460, cy: 125 },
  NL: { cx: 410, cy: 115 },
  DE: { cx: 420, cy: 125 },
  GB: { cx: 395, cy: 115 },
};

const getHeatColor = (share: number) => {
  if (share >= 20) return '#ef4444';
  if (share >= 12) return '#f97316';
  if (share >= 7) return '#f59e0b';
  return '#3b82f6';
};

export default function AttackSourcesMap({ data, onSelectCountry }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState<AttackCountryItem | null>(null);

  const totalAttacks = data.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <AttackGlobeIcon size={18} color="#ef4444" />
            <h3 className={styles.title}>Attack Sources &amp; Geopolitical Origins</h3>
          </div>
          <p className={styles.subtitle}>
            Aggregated intrusion origins and telemetry volumes across global regions
          </p>
        </div>
        <span className={styles.badge}>{totalAttacks.toLocaleString()} Total Inbound</span>
      </div>

      <div className={styles.contentGrid}>
        {/* World Geographic Vector Map Projection */}
        <div className={styles.mapWrapper}>
          <svg
            className={styles.worldSvg}
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="grid-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--border)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Latitude & Longitude Coordinate Grid */}
            <rect width="800" height="400" fill="transparent" />
            {[80, 160, 240, 320].map(y => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="var(--border)" strokeDasharray="3 3" opacity={0.3} />
            ))}
            {[160, 320, 480, 640].map(x => (
              <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="400" stroke="var(--border)" strokeDasharray="3 3" opacity={0.3} />
            ))}

            {/* Stylized Continents Outlines */}
            {/* North America */}
            <path
              d="M120 70 Q 180 50, 240 70 T 280 130 T 220 190 T 160 160 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            {/* South America */}
            <path
              d="M230 200 Q 290 220, 270 290 T 240 360 T 210 270 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            {/* Europe */}
            <path
              d="M380 70 Q 450 60, 460 110 T 430 150 T 370 120 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            {/* Africa */}
            <path
              d="M380 160 Q 450 160, 470 230 T 430 330 T 370 240 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            {/* Asia */}
            <path
              d="M480 60 Q 640 40, 710 110 T 660 210 T 500 170 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            {/* Oceania / Australia */}
            <path
              d="M620 260 Q 700 250, 710 310 T 630 340 Z"
              fill="var(--surface-hover)"
              stroke="var(--border)"
              strokeWidth={1}
            />

            {/* Geopolitical Attack Origin Hotspot Nodes */}
            {data.map(country => {
              const coords = COUNTRY_COORDS[country.code] || { cx: 400, cy: 200 };
              const share = country.share ?? country.percentage ?? 0;
              const color = getHeatColor(share);
              const radius = Math.max(5, Math.min(16, Math.round(share * 0.7 + 4)));
              const isHovered = hoveredCountry?.code === country.code;

              return (
                <g
                  key={country.code}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => onSelectCountry?.(country)}
                >
                  {/* Radar pulse ring */}
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={radius * 1.8}
                    fill={color}
                    opacity={isHovered ? 0.35 : 0.15}
                  />
                  {/* Core marker */}
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={radius}
                    fill={color}
                    stroke="var(--surface)"
                    strokeWidth={1.5}
                    opacity={0.9}
                  />
                  {/* Label */}
                  {share >= 8 && (
                    <text
                      x={coords.cx}
                      y={coords.cy - radius - 3}
                      fill="var(--text)"
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="var(--font-mono, monospace)"
                    >
                      {country.code}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Ranked Origin Countries List */}
        <div className={styles.countryList}>
          {data.map(country => {
            const isHovered = hoveredCountry?.code === country.code;
            const share = country.share ?? country.percentage ?? 0;
            const color = getHeatColor(share);
            const countryDisplayName = country.name || country.country || country.code;

            return (
              <div
                key={country.code}
                className={`${styles.countryRow} ${isHovered ? styles.countryRowActive : ''}`}
                onMouseEnter={() => setHoveredCountry(country)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => onSelectCountry?.(country)}
              >
                <div className={styles.countryLeft}>
                  <span className={styles.countryCode}>{country.code}</span>
                  <span className={styles.countryName}>{countryDisplayName}</span>
                </div>

                <div className={styles.countryRight}>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${Math.min(100, share * 3.5)}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span className={styles.countryCount}>
                    {country.count.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({share}%)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
