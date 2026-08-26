export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatusType = 'open' | 'investigating' | 'contained' | 'resolved';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: ThreatSeverity;
  sourceCountry: string;
  sourceCountryCode: string;
  sourceIp: string;
  targetAsset: string;
  targetAssetType: string;
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  mitreTactic: string;
  status: string;
  actionTaken: string;
  rawPayload?: string;
}

export interface SecurityAsset {
  id: string;
  name: string;
  type: 'Server' | 'Database' | 'API Gateway' | 'Endpoint' | 'Cloud Resource' | 'Kubernetes Cluster' | 'Storage';
  ip: string;
  department: string;
  likelihood: number; // 0 - 100
  impact: number;     // 0 - 100
  vulnerabilityCount: number;
  criticalVulnerabilities: number;
  riskScore: number;
  status: 'secure' | 'warning' | 'compromised';
}

export interface CVSSBreakdown {
  version: string;
  vectorString: string;
  baseScore: number;
  attackVector: { code: string; label: string; desc: string };
  attackComplexity: { code: string; label: string; desc: string };
  privilegesRequired: { code: string; label: string; desc: string };
  userInteraction: { code: string; label: string; desc: string };
  scope: { code: string; label: string; desc: string };
  confidentialityImpact: { code: string; label: string; desc: string };
  integrityImpact: { code: string; label: string; desc: string };
  availabilityImpact: { code: string; label: string; desc: string };
}

export interface VulnerabilityItem {
  id: string;
  title: string;
  severity: ThreatSeverity;
  cvssScore: number;
  cvssVector: string;
  affectedAsset: string;
  affectedComponent: string;
  cwe: string;
  publishedDate: string;
  patchAvailable: boolean;
  description: string;
  remediation: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: ThreatSeverity;
  status: IncidentStatusType;
  assignee: string;
  affectedAsset: string;
  threatType: string;
  detectionTime: string;
  resolvedTime?: string;
  timeline: {
    timestamp: string;
    note: string;
    status: IncidentStatusType;
  }[];
}

export interface AttackSourceCountry {
  country: string;
  code: string;
  count: number;
  criticalCount: number;
  percentage: number;
  primaryThreat: string;
}

export interface MitreTechniqueItem {
  id: string;
  name: string;
  tactic: string;
  count: number;
  severity: ThreatSeverity;
  description: string;
}

export interface SecurityPostureDimension {
  axis: string;
  current: number;
  benchmark: number;
  fullMark: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface TimeSeriesThreatPoint {
  timeLabel: string;
  timestamp: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface IncidentTimelinePoint {
  timeLabel: string;
  timestamp: string;
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  total: number;
}
