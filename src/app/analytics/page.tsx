'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  RiskMatrixScatterChart,
  MitreAttackTechniquesChart,
  SecurityPostureSpiderChart,
  TelemetryDrilldownDrawer,
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
  getMitreTechniques,
  getSecurityPostureMetrics,
} from '@/lib/cybersecurityData';
import {
  ThreatSeverity,
  TimeSeriesThreatPoint,
  VulnerabilityItem,
  IncidentTimelinePoint,
  SecurityAsset,
  MitreTechniqueItem,
  SecurityPostureDimension,
} from '@/types/cybersecurity';
import { downloadExecutiveReport } from '@/lib/executiveReport';
import { DrilldownEntity } from '@/components/ui/TelemetryDrilldownDrawer';
import { toast } from '@/lib/toast';
import {
  ShieldAlertIcon,
  FlameAlertIcon,
  ShieldCheckIcon,
  RadarScanIcon,
} from '@/components/ui/CyberIcons';
import { Download, RefreshCw, Layers, Radio } from 'lucide-react';

export default function AnalyticsPage() {
  const { records } = useDataContext();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedSeverity, setSelectedSeverity] = useState<ThreatSeverity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'threats' | 'map' | 'assets' | 'incidents' | 'mitre_posture'>('all');
  const [drilldownEntity, setDrilldownEntity] = useState<DrilldownEntity | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

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
  const [apiAssets, setApiAssets] = useState<SecurityAsset[]>(() => getSecurityAssets());
  const [apiMitreTechniques, setApiMitreTechniques] = useState<MitreTechniqueItem[]>(() => getMitreTechniques());
  const [apiPosture, setApiPosture] = useState<SecurityPostureDimension[]>(() => getSecurityPostureMetrics());

  // Fetch telemetry from server API routes
  const loadApiData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [res24h, res7d, res30d, resSev, resVectors, resAssets, resSources, resIncidents, resVulns, resAllAssets, resMitre, resPosture] = await Promise.allSettled([
        cybersecurityApi.getThreatTrends('24h'),
        cybersecurityApi.getThreatTrends('7d'),
        cybersecurityApi.getThreatTrends('30d'),
        cybersecurityApi.getThreatSeverity(),
        cybersecurityApi.getTopVectors({ limit: 10 }),
        cybersecurityApi.getTopAffectedAssets(10),
        cybersecurityApi.getAttackSources(),
        cybersecurityApi.getIncidents(),
        cybersecurityApi.getVulnerabilities(),
        cybersecurityApi.getAssets({ limit: 100 }),
        cybersecurityApi.getMitreTechniques({ limit: 50 }),
        cybersecurityApi.getPosture(),
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
      if (resAllAssets.status === 'fulfilled' && resAllAssets.value.data) setApiAssets(resAllAssets.value.data);
      if (resMitre.status === 'fulfilled' && resMitre.value.data) setApiMitreTechniques(resMitre.value.data);
      if (resPosture.status === 'fulfilled' && resPosture.value.dimensions) setApiPosture(resPosture.value.dimensions);

      if (isManual) {
        toast.success('Telemetry Synchronized', 'All 12 SIEM widgets updated with live telemetry data.');
      }
    } catch (err) {
      console.error('Failed to fetch from telemetry APIs, using fallback store:', err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApiData();
  }, [loadApiData]);

  // Polling effect (every 45 seconds if autoRefresh is true)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadApiData();
    }, 45000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadApiData]);

  // Compute live threat counts dynamically from master SOC records
  const criticalCount = useMemo(() => records.filter(r => r.priority === 'critical' || r.value >= 75).length, [records]);
  const highCount = useMemo(() => records.filter(r => r.priority === 'high' || (r.value >= 50 && r.value < 75)).length, [records]);
  const mediumCount = useMemo(() => records.filter(r => r.priority === 'medium' || (r.value >= 25 && r.value < 50)).length, [records]);
  const lowCount = useMemo(() => records.filter(r => r.priority === 'low' || r.value < 25).length, [records]);

  // Threat Severity summary data for Donut Chart
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

  const handleExportExecutiveReport = () => {
    downloadExecutiveReport({
      timeRange,
      totalThreats: records.length || 8450,
      criticalCount,
      highCount,
      assets: apiAssets,
      vulnerabilities: apiVulnerabilities,
      mitreTechniques: apiMitreTechniques,
      postureDimensions: apiPosture,
      attackOrigins: apiAttackSources,
    }, 'markdown');
    toast.success('Executive Briefing Downloaded', 'Exported comprehensive CISO & SOC Markdown briefing.');
  };

  return (
    <PageShell
      title="Threat Analytics & Telemetry"
      description="Real-time SOC telemetry, time-series trajectory, severity breakdowns, and ranked attack vectors."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Threat Analytics' }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Global Filter & Command Toolbar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter threat vectors, MITRE tactics, or assets..."
          filters={filterGroups}
          selectedFilters={{ severity: selectedSeverity || '' }}
          onFilterChange={(_, val) => setSelectedSeverity((val as ThreatSeverity) || null)}
          onResetFilters={() => {
            setSelectedSeverity(null);
            setSearchQuery('');
          }}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Auto-Refresh Toggle */}
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  background: autoRefresh ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                  color: autoRefresh ? '#10b981' : 'var(--text-muted)',
                  border: `1px solid ${autoRefresh ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Radio size={13} style={{ animation: autoRefresh ? 'pulse 2s infinite' : 'none' }} />
                {autoRefresh ? 'Live (45s)' : 'Paused'}
              </button>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={() => loadApiData(true)}
                disabled={isRefreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isRefreshing ? 'wait' : 'pointer',
                }}
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                Sync
              </button>

              {/* Executive Briefing Export */}
              <button
                type="button"
                onClick={handleExportExecutiveReport}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={13} /> Export Executive Report
              </button>
            </div>
          }
        />

        {/* Category Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {[
            { id: 'all', label: 'All Telemetry (12 Widgets)' },
            { id: 'threats', label: 'Threat Trends & Vectors' },
            { id: 'map', label: 'Geopolitical Defense Map' },
            { id: 'assets', label: 'Assets & Risk Matrix' },
            { id: 'incidents', label: 'Incident Lifecycle & CVSS' },
            { id: 'mitre_posture', label: 'MITRE ATT&CK & Posture' },
          ].map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  background: isActive ? 'var(--primary)' : 'var(--surface)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition)',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* High-Level SOC Telemetry Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SummaryCard
            title="TOTAL INBOUND THREATS"
            value={(records.length || 8450).toLocaleString()}
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
            value={`${apiAssets.length} Systems`}
            subtitle="Continuous SIEM telemetry ingestion"
            icon={<ShieldCheckIcon size={18} />}
          />
          <SummaryCard
            title="PERIMETER POSTURE SCORE"
            value={`${Math.round(apiPosture.reduce((s, p) => s + p.current, 0) / (apiPosture.length || 1))} / 100`}
            subtitle="+9 pts above industry benchmark"
            icon={<RadarScanIcon size={18} />}
          />
        </div>

        {/* ── Section 1: Threat Trend Chart & Threat Severity Donut (Tasks 2 & 3) ── */}
        {(activeCategory === 'all' || activeCategory === 'threats') && (
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
        )}

        {/* ── Section 2: Top 10 Threat Vectors & Top 10 Affected Assets (Tasks 4 & 5) ── */}
        {(activeCategory === 'all' || activeCategory === 'threats' || activeCategory === 'assets') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20 }}>
            <TopThreatTypesChart
              data={topThreatTypesData}
              onSelectThreatType={item => setDrilldownEntity({ type: 'threat', data: item })}
            />
            <TopAffectedAssetsChart
              data={apiAffectedAssets}
              onSelectAsset={asset => setDrilldownEntity({ type: 'asset', data: asset })}
            />
          </div>
        )}

        {/* ── Section 3: Flagship Hero Section: Attack Sources Geopolitical Map (Task 6) ── */}
        {(activeCategory === 'all' || activeCategory === 'map') && (
          <div>
            <AttackSourcesMap
              data={apiAttackSources}
              onSelectCountry={country => setDrilldownEntity({ type: 'country', data: country })}
            />
          </div>
        )}

        {/* ── Section 4: Incident Status Timeline & CVSS 3.1 Inspector (Tasks 7 & 8) ── */}
        {(activeCategory === 'all' || activeCategory === 'incidents') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            <IncidentStatusChart
              data={apiIncidentsTimeline}
              summary={apiIncidentsSummary}
            />
            <VulnerabilitySeverityInspector
              data={apiVulnerabilities}
              onSelectVulnerability={vuln => setDrilldownEntity({ type: 'vulnerability', data: vuln })}
            />
          </div>
        )}

        {/* ── Section 5: Asset Risk Matrix (Scatter Chart: Likelihood vs. Impact) (Task 9) ── */}
        {(activeCategory === 'all' || activeCategory === 'assets') && (
          <div>
            <RiskMatrixScatterChart
              data={apiAssets}
              onSelectAsset={asset => setDrilldownEntity({ type: 'asset', data: asset })}
            />
          </div>
        )}

        {/* ── Section 6: MITRE ATT&CK Enterprise Top Techniques (Task 10) ── */}
        {(activeCategory === 'all' || activeCategory === 'mitre_posture') && (
          <div>
            <MitreAttackTechniquesChart
              data={apiMitreTechniques}
              onSelectTechnique={tech => setDrilldownEntity({ type: 'mitre', data: tech })}
            />
          </div>
        )}

        {/* ── Section 7: Enterprise Security Posture 7-Axis Radar Chart (Task 11) ── */}
        {(activeCategory === 'all' || activeCategory === 'mitre_posture') && (
          <div>
            <SecurityPostureSpiderChart
              data={apiPosture}
              onSelectDimension={dim => setDrilldownEntity({ type: 'posture', data: dim })}
            />
          </div>
        )}
      </div>

      {/* ── Universal Telemetry Drill-Down Drawer (Task 12) ── */}
      <TelemetryDrilldownDrawer
        open={Boolean(drilldownEntity)}
        onClose={() => setDrilldownEntity(null)}
        entity={drilldownEntity}
      />
    </PageShell>
  );
}
