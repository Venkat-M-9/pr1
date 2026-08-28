'use client';

import Drawer from './Drawer';
import StatusBadge from './StatusBadge';
import { toast } from '@/lib/toast';
import {
  ShieldAlertIcon,
  ShieldCheckIcon,
  AttackGlobeIcon,
  RadarScanIcon,
} from './CyberIcons';
import { Download, Lock, ShieldBan, Zap, ExternalLink, Activity } from 'lucide-react';
import styles from './TelemetryDrilldownDrawer.module.css';

export type DrilldownEntity =
  | { type: 'asset'; data: any }
  | { type: 'vulnerability'; data: any }
  | { type: 'mitre'; data: any }
  | { type: 'threat'; data: any }
  | { type: 'country'; data: any }
  | { type: 'posture'; data: any };

interface Props {
  open: boolean;
  onClose: () => void;
  entity: DrilldownEntity | null;
}

export default function TelemetryDrilldownDrawer({ open, onClose, entity }: Props) {
  if (!entity) return null;

  const { type, data } = entity;

  // Actions
  const handleIsolateHost = () => {
    toast.warning(
      `Quarantine Activated: ${data.name || data.id || 'Target Host'}`,
      `Host has been isolated to VLAN-999. Ingress/Egress microsegmentation enforced.`
    );
  };

  const handleBlockCidr = () => {
    toast.warning(
      `Firewall Rule Applied: ${data.code || data.ip || 'Origin IP'}`,
      `Inbound CIDR drops enforced across Cloudflare and AWS WAF edge nodes.`
    );
  };

  const handleRunSoar = () => {
    toast.success(
      `SOAR Playbook Executed: ${data.name || data.id || 'Workflow'}`,
      `Automated containment, token revocation, and forensic memory snapshots triggered.`
    );
  };

  const handleExportTicket = () => {
    const payload = {
      entityType: type,
      timestamp: new Date().toISOString(),
      details: data,
      auditLog: 'Generated via Unified SOC Analytics Command Center',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-ticket-${type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Incident Ticket Downloaded', 'Exported full JSON forensic packet.');
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Security Telemetry Deep-Dive"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={onClose}
          >
            Close Inspector
          </button>
        </div>
      }
    >
      <div className={styles.container}>
        {/* ── Entity Header ── */}
        <div className={styles.heroHeader}>
          <div className={styles.heroLeft}>
            <div className={styles.badgeRow}>
              <span className={styles.typeBadge}>{type}</span>
              {data.severity && (
                <StatusBadge
                  value={data.severity}
                  variant="priority"
                />
              )}
            </div>
            <h3 className={styles.entityTitle}>{data.name || data.title || data.type || data.country || data.axis || data.id}</h3>
            <span className={styles.entitySubtitle}>
              {data.ip ? `IP: ${data.ip}` : data.id ? `ID: ${data.id}` : data.code ? `ISO: ${data.code}` : `Framework: ${data.frameworkRef || 'NIST CSF'}`}
            </span>
          </div>

          {(data.riskScore !== undefined || data.cvssScore !== undefined || data.current !== undefined) && (
            <div
              className={styles.scoreBadge}
              style={{
                borderColor: (data.riskScore >= 75 || data.cvssScore >= 9.0) ? '#ef4444' : '#0ea5e9',
                color: (data.riskScore >= 75 || data.cvssScore >= 9.0) ? '#ef4444' : '#0ea5e9',
              }}
            >
              <span className={styles.scoreNum}>
                {data.riskScore ?? data.cvssScore ?? data.current}
              </span>
              <span className={styles.scoreLabel}>
                {data.cvssScore !== undefined ? 'CVSS' : data.current !== undefined ? 'POSTURE' : 'FAIR'}
              </span>
            </div>
          )}
        </div>

        {/* ── Key Metrics Grid ── */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>
            <Activity size={14} color="var(--primary)" /> Telemetry Metrics &amp; Parameters
          </span>
          <div className={styles.gridStats}>
            {data.department && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Department / Owner</span>
                <span className={styles.statVal}>{data.department}</span>
              </div>
            )}
            {data.likelihood !== undefined && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Threat Likelihood</span>
                <span className={styles.statVal}>{data.likelihood}%</span>
              </div>
            )}
            {data.impact !== undefined && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Business Impact</span>
                <span className={styles.statVal}>{data.impact}%</span>
              </div>
            )}
            {data.vulnerabilityCount !== undefined && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Vulnerabilities</span>
                <span className={styles.statVal} style={{ color: data.criticalVulnerabilities > 0 ? '#ef4444' : 'var(--text)' }}>
                  {data.vulnerabilityCount} ({data.criticalVulnerabilities || 0} Critical)
                </span>
              </div>
            )}
            {data.count !== undefined && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Security Events</span>
                <span className={styles.statVal} style={{ color: '#ef4444' }}>
                  {data.count.toLocaleString()}
                </span>
              </div>
            )}
            {data.tactic && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>MITRE Tactic</span>
                <span className={styles.statVal}>{data.tactic}</span>
              </div>
            )}
            {data.benchmark !== undefined && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Peer Benchmark</span>
                <span className={styles.statVal}>{data.benchmark}/100</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Behavior / Description ── */}
        {(data.description || data.remediation || data.recommendation) && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>
              <ShieldAlertIcon size={14} color="#f97316" /> Technical Context &amp; Remediation
            </span>
            {data.description && <p className={styles.bodyText}>{data.description}</p>}
            {(data.remediation || data.recommendation || data.mitigation) && (
              <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#10b981' }}>
                  Prescribed Countermeasure:
                </span>
                <p className={styles.bodyText} style={{ marginTop: 2 }}>
                  {data.remediation || data.recommendation || data.mitigation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Threat Actors / Detection ── */}
        {data.threatActors && data.threatActors.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Observed Threat Actor Campaigns</span>
            <div className={styles.tagList}>
              {data.threatActors.map((actor: string) => (
                <span key={actor} className={styles.tag} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  {actor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Playbooks Grid ── */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>
            <ShieldCheckIcon size={14} color="#10b981" /> Automated Incident Response Actions
          </span>
          <div className={styles.actionGrid}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={handleIsolateHost}
            >
              <Lock size={14} /> Isolate Host Subnet
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={handleBlockCidr}
            >
              <ShieldBan size={14} /> Block Ingress CIDR
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={handleRunSoar}
            >
              <Zap size={14} /> Trigger SOAR Flow
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleExportTicket}
            >
              <Download size={14} /> Export Forensic Ticket
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
