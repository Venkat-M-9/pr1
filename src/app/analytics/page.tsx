'use client';

import { useEffect, useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import FilterBar from '@/components/ui/FilterBar';
import SummaryCard from '@/components/ui/SummaryCard';
import {
  ThreatTrendChart,
  ThreatSeverityDonut,
  TopThreatTypesChart,
  TopAffectedAssetsChart,
  AttackSourcesMap,
  IncidentStatusChart,
  VulnerabilitySeverityInspector,
} from '@/components';
import { useDataContext } from '@/context/DataContext';
import { cybersecurityApi } from '@/lib/apiClient';
import {
  getThreatTrends,
  THREAT_TYPES,
  getSecurityAssets,
  getAttackSourceCountries,
  getIncidentTrends,
  getVulnerabilities,
} from '@/lib/cybersecurityData';
import { ThreatSeverity, TimeSeriesThreatPoint, VulnerabilityItem, IncidentTimelinePoint } from '@/types/cybersecurity';
import { toast } from '@/lib/toast';
import {
  ShieldAlertIcon,
  FlameAlertIcon,
  ShieldCheckIcon,
  RadarScanIcon,
} from '@/components/ui/CyberIcons';
import { Download } from 'lucide-react';

export default function AnalyticsPage() {
  const { records } = useDataContext();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedSeverity, setSelectedSeverity] = useState<ThreatSeverity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // API State
  const [trend24h, setTrend24h] = useState<TimeSeriesThreatPoint[]>(() => getThreatTrends('24h'));
  const [trend7d, setTrend7d] = useState<TimeSeriesThreatPoint[]>(() => getThreatTrends('7d'));
  const [trend30d, setTrend30d] = useState<TimeSeriesThreatPoint[]>(() => getThreatTrends('30d'));
  const [apiSeverityData, setApiSeverityData] = useState<any[] | null>(null);
  const [apiVectorsData, setApiVectorsData] = useState<any[] | null>(null);
  const [apiAffectedAssets, setApiAffectedAssets] = useState<any[]>(() => {
    const assets = getSecurityAssets();
    return assets.map((a, idx) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      ip: a.ip,
      department: a.department,
      securityEvents: Math.round(a.likelihood * 14 + a.impact * 8 + a.criticalVulnerabilities * 120 + (12 - idx) * 45),
      vulnerabilityCount: a.vulnerabilityCount,
      criticalVulnerabilities: a.criticalVulnerabilities,
      riskScore: a.riskScore,
      status: a.status,
    })).sort((a, b) => b.securityEvents - a.securityEvents).slice(0, 10);
  });
  const [apiAttackSources, setApiAttackSources] = useState<any[]>(() => getAttackSourceCountries());
  const [apiIncidentsTimeline, setApiIncidentsTimeline] = useState<IncidentTimelinePoint[]>(() => getIncidentTrends());
  const [apiIncidentsSummary, setApiIncidentsSummary] = useState<any>(null);
  const [apiVulnerabilities, setApiVulnerabilities] = useState<VulnerabilityItem[]>(() => getVulnerabilities());

  // Fetch from real server API routes
  useEffect(() => {
    async function loadApiData() {
      try {
        const [res24h, res7d, res30d, resSev, resVectors, resAssets, resSources, resIncidents, resVulns] = await Promise.allSettled([
          cybersecurityApi.getThreatTrends('24h'),
          cybersecurityApi.getThreatTrends('7d'),
          cybersecurityApi.getThreatTrends('30d'),
          cybersecurityApi.getThreatSeverity(),
          cybersecurityApi.getTopVectors({ limit: 10 }),
          cybersecurityApi.getTopAffectedAssets(10),
          cybersecurityApi.getAttackSources(),
          cybersecurityApi.getIncidents(),
          cybersecurityApi.getVulnerabilities(),
        ]);

        if (res24h.status === 'fulfilled' && res24h.value.data) setTrend24h(res24h.value.data);
        if (res7d.status === 'fulfilled' && res7d.value.data) setTrend7d(res7d.value.data);
        if (res30d.status === 'fulfilled' && res30d.value.data) setTrend30d(res30d.value.data);
        if (resSev.status === 'fulfilled' && resSev.value.data) setApiSeverityData(resSev.value.data);
        if (resVectors.status === 'fulfilled' && resVectors.value.data) setApiVectorsData(resVectors.value.data);
        if (resAssets.status === 'fulfilled' && resAssets.value.data) setApiAffectedAssets(resAssets.value.data);
        if (resSources.status === 'fulfilled' && resSources.value.countries) setApiAttackSources(resSources.value.countries);
        if (resIncidents.status === 'fulfilled' && resIncidents.value.timeline) {
          setApiIncidentsTimeline(resIncidents.value.timeline);
          setApiIncidentsSummary(resIncidents.value.summary);
        }
        if (resVulns.status === 'fulfilled' && resVulns.value.data) setApiVulnerabilities(resVulns.value.data);
      } catch (err) {
        console.error('Failed to fetch from telemetry APIs, using fallback store:', err);
      }
    }
    loadApiData();
  }, []);

  // Compute live threat counts dynamically from master SOC records
  const criticalCount = useMemo(() => records.filter(r => r.priority === 'critical' || r.value >= 75).length, [records]);
  const highCount = useMemo(() => records.filter(r => r.priority === 'high' || (r.value >= 50 && r.value < 75)).length, [records]);
  const mediumCount = useMemo(() => records.filter(r => r.priority === 'medium' || (r.value >= 25 && r.value < 50)).length, [records]);
  const lowCount = useMemo(() => records.filter(r => r.priority === 'low' || r.value < 25).length, [records]);

  // Threat Severity summary data for Donut Chart (prefers live API response, synchronized with DataContext records)
  const severityDonutData = useMemo(() => {
    if (apiSeverityData && apiSeverityData.length > 0) {
      return apiSeverityData;
    }
    return [
      { name: 'Critical', severity: 'critical' as ThreatSeverity, count: criticalCount, color: '#dc2626' },
      { name: 'High', severity: 'high' as ThreatSeverity, count: highCount, color: '#ea580c' },
      { name: 'Medium', severity: 'medium' as ThreatSeverity, count: mediumCount, color: '#d97706' },
      { name: 'Low', severity: 'low' as ThreatSeverity, count: lowCount, color: '#2563eb' },
    ];
  }, [apiSeverityData, criticalCount, highCount, mediumCount, lowCount]);

  // Top Threat Types metrics for Horizontal Bar Chart
  const topThreatTypesData = useMemo(() => {
    const rawList = apiVectorsData && apiVectorsData.length > 0
      ? apiVectorsData
      : THREAT_TYPES.map((t, idx) => ({
          type: t.type,
          count: Math.round(1850 / (idx * 0.38 + 1)),
          tactic: t.tactic,
          techniqueId: t.techniqueId,
          severity: t.defaultSev,
        }));

    if (!selectedSeverity && !searchQuery) return rawList;

    return rawList.filter((item: any) => {
      if (selectedSeverity && item.severity !== selectedSeverity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.type.toLowerCase().includes(q) ||
          item.tactic.toLowerCase().includes(q) ||
          item.techniqueId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [apiVectorsData, selectedSeverity, searchQuery]);

  const filterGroups = [
    {
      id: 'severity',
      label: 'Threat Severity',
      options: [
        { label: 'Critical Severity', value: 'critical' },
        { label: 'High Severity', value: 'high' },
        { label: 'Medium Severity', value: 'medium' },
        { label: 'Low Severity', value: 'low' },
      ],
    },
  ];

  const handleExportTelemetry = () => {
    toast.crud('export', 'Telemetry Report Exported', `Generated SOC telemetry brief (${timeRange.toUpperCase()} slice).`);
  };

  return (
    <PageShell
      title="Threat Analytics & Telemetry"
      description="Real-time SOC telemetry, time-series trajectory, severity breakdowns, and ranked attack vectors."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Threat Analytics' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Global Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter threat vectors or MITRE tactics..."
          filters={filterGroups}
          selectedFilters={{ severity: selectedSeverity || '' }}
          onFilterChange={(_, val) => setSelectedSeverity((val as ThreatSeverity) || null)}
          onResetFilters={() => {
            setSelectedSeverity(null);
            setSearchQuery('');
          }}
          actions={
            <button
              type="button"
              onClick={handleExportTelemetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Export Telemetry
            </button>
          }
        />

        {/* High-Level SOC Telemetry Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SummaryCard
            title="TOTAL INBOUND THREATS"
            value={records.length.toLocaleString()}
            subtitle="Analyzed across all perimeter sensors"
            icon={<ShieldAlertIcon size={18} />}
          />
          <SummaryCard
            title="CRITICAL THREAT INCIDENTS"
            value={criticalCount.toLocaleString()}
            subtitle="Immediate containment priority"
            icon={<FlameAlertIcon size={18} color="#ef4444" />}
          />
          <SummaryCard
            title="ACTIVE MONITORED ASSETS"
            value={`${records.length.toLocaleString()} Systems`}
            subtitle="Continuous SIEM telemetry ingestion"
            icon={<ShieldCheckIcon size={18} />}
          />
          <SummaryCard
            title="PERIMETER POSTURE SCORE"
            value="78 / 100"
            subtitle="+13 pts above industry benchmark"
            icon={<RadarScanIcon size={18} />}
          />
        </div>

        {/* ── Task 2: Threat Trend Chart & Task 3: Threat Severity Donut ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          <ThreatTrendChart
            data24h={trend24h}
            data7d={trend7d}
            data30d={trend30d}
            onTimeRangeChange={setTimeRange}
          />
          <ThreatSeverityDonut
            data={severityDonutData}
            selectedSeverity={selectedSeverity}
            onSelectSeverity={setSelectedSeverity}
          />
        </div>

        {/* ── Task 4: Top 10 Threat Vectors & Task 5: Top 10 Affected Assets ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
          <TopThreatTypesChart
            data={topThreatTypesData}
            onSelectThreatType={item => {
              toast.info(
                `Threat Vector: ${item.type}`,
                `MITRE Technique: ${item.techniqueId} · Tactic: ${item.tactic} · Detections: ${item.count.toLocaleString()}`
              );
            }}
          />
          <TopAffectedAssetsChart
            data={apiAffectedAssets}
            onSelectAsset={asset => {
              toast.info(
                `Target Asset: ${asset.name}`,
                `${asset.type} · IP: ${asset.ip} · Risk Score: ${asset.riskScore}/100 · Events: ${asset.securityEvents.toLocaleString()}`
              );
            }}
          />
        </div>

        {/* ── Task 6: Attack Sources Map & Task 7: Incident Status ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
          <AttackSourcesMap
            data={apiAttackSources}
            onSelectCountry={country => {
              toast.info(
                `Origin: ${country.name} (${country.code})`,
                `Inbound Intrusion Attempts: ${country.count.toLocaleString()} (${country.share}% global share)`
              );
            }}
          />
          <IncidentStatusChart
            data={apiIncidentsTimeline}
            summary={apiIncidentsSummary}
          />
        </div>

        {/* ── Task 8: Vulnerability Severity & CVSS 3.1 Vector Inspector ── */}
        <div>
          <VulnerabilitySeverityInspector
            data={apiVulnerabilities}
            onSelectVulnerability={vuln => {
              toast.info(
                `Inspecting ${vuln.id}`,
                `CVSS ${vuln.cvssScore.toFixed(1)} · ${vuln.affectedAsset} · ${vuln.title}`
              );
            }}
          />
        </div>
      </div>
    </PageShell>
  );
}
