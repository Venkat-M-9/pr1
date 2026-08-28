/**
 * Unified Client API Service for Cybersecurity Telemetry
 * Interacts directly with the Next.js /api/... server routes
 */

import {
  TimeSeriesThreatPoint,
  ThreatSeverity,
  SecurityAsset,
  SecurityIncident,
  IncidentTimelinePoint,
  VulnerabilityItem,
  SecurityPostureDimension,
} from '@/types/cybersecurity';

export interface ThreatTrendsResponse {
  success: boolean;
  timeRange: '24h' | '7d' | '30d';
  totalThreats: number;
  criticalThreats: number;
  data: TimeSeriesThreatPoint[];
}

export interface ThreatSeverityResponse {
  success: boolean;
  totalEvents: number;
  data: Array<{
    name: string;
    severity: ThreatSeverity;
    count: number;
    color: string;
    percentage: number;
  }>;
}

export interface TopVectorsResponse {
  success: boolean;
  totalCount: number;
  data: Array<{
    type: string;
    count: number;
    tactic: string;
    techniqueId: string;
    severity: ThreatSeverity;
  }>;
}

export interface AssetsResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: SecurityAsset[];
}

export interface TopAffectedAssetsResponse {
  success: boolean;
  totalAssetsAnalyzed: number;
  data: Array<{
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
  }>;
}

export interface IncidentsResponse {
  success: boolean;
  summary: {
    total: number;
    open: number;
    investigating: number;
    contained: number;
    resolved: number;
  };
  timeline: IncidentTimelinePoint[];
  incidents: SecurityIncident[];
}

export interface VulnerabilitiesResponse {
  success: boolean;
  totalVulnerabilities: number;
  meanCvssScore: number;
  data: VulnerabilityItem[];
}

export interface PostureResponse {
  success: boolean;
  overallScore: number;
  overallBenchmark: number;
  delta: number;
  dimensions: SecurityPostureDimension[];
}

export interface AttackSourcesResponse {
  success: boolean;
  totalAttacks: number;
  countries: Array<{
    code: string;
    name: string;
    count: number;
    share: number;
  }>;
}

export const cybersecurityApi = {
  // Threat Trend Telemetry
  async getThreatTrends(range: '24h' | '7d' | '30d' = '24h'): Promise<ThreatTrendsResponse> {
    const res = await fetch(`/api/threats/trends?range=${range}`);
    if (!res.ok) throw new Error(`Threat trends API error: ${res.statusText}`);
    return res.json();
  },

  // Threat Severity Distribution
  async getThreatSeverity(): Promise<ThreatSeverityResponse> {
    const res = await fetch('/api/threats/severity');
    if (!res.ok) throw new Error(`Severity API error: ${res.statusText}`);
    return res.json();
  },

  // Top Threat Vectors
  async getTopVectors(params?: { limit?: number; severity?: ThreatSeverity; search?: string }): Promise<TopVectorsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.search) searchParams.set('search', params.search);

    const res = await fetch(`/api/threats/top-vectors?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`Top vectors API error: ${res.statusText}`);
    return res.json();
  },

  // Security Assets
  async getAssets(params?: { search?: string; severity?: string; status?: string; page?: number; limit?: number }): Promise<AssetsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const res = await fetch(`/api/assets?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`Assets API error: ${res.statusText}`);
    return res.json();
  },

  async getTopAffectedAssets(limit = 10): Promise<TopAffectedAssetsResponse> {
    const res = await fetch(`/api/assets/top-affected?limit=${limit}`);
    if (!res.ok) throw new Error(`Top affected assets API error: ${res.statusText}`);
    return res.json();
  },

  async createAsset(asset: Partial<SecurityAsset>): Promise<{ success: boolean; data: SecurityAsset }> {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    if (!res.ok) throw new Error(`Create asset API error: ${res.statusText}`);
    return res.json();
  },

  async updateAsset(id: string, updates: Partial<SecurityAsset>): Promise<{ success: boolean; data: SecurityAsset }> {
    const res = await fetch(`/api/assets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Update asset API error: ${res.statusText}`);
    return res.json();
  },

  async deleteAsset(id: string): Promise<{ success: boolean; data: SecurityAsset }> {
    const res = await fetch(`/api/assets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Delete asset API error: ${res.statusText}`);
    return res.json();
  },

  // Incidents
  async getIncidents(status?: string): Promise<IncidentsResponse> {
    const url = status ? `/api/incidents?status=${encodeURIComponent(status)}` : '/api/incidents';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Incidents API error: ${res.statusText}`);
    return res.json();
  },

  // Vulnerabilities
  async getVulnerabilities(severity?: string): Promise<VulnerabilitiesResponse> {
    const url = severity ? `/api/vulnerabilities?severity=${encodeURIComponent(severity)}` : '/api/vulnerabilities';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Vulnerabilities API error: ${res.statusText}`);
    return res.json();
  },

  // Posture
  async getPosture(): Promise<PostureResponse> {
    const res = await fetch('/api/posture');
    if (!res.ok) throw new Error(`Posture API error: ${res.statusText}`);
    return res.json();
  },

  // Attack Sources
  async getAttackSources(): Promise<AttackSourcesResponse> {
    const res = await fetch('/api/attack-sources');
    if (!res.ok) throw new Error(`Attack sources API error: ${res.statusText}`);
    return res.json();
  },
};
