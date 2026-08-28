import {
  TimeSeriesThreatPoint,
  SecurityAsset,
  VulnerabilityItem,
  MitreTechniqueItem,
  SecurityPostureDimension,
} from '@/types/cybersecurity';

interface ReportInput {
  timeRange: string;
  totalThreats: number;
  criticalCount: number;
  highCount: number;
  assets: SecurityAsset[];
  vulnerabilities: VulnerabilityItem[];
  mitreTechniques: MitreTechniqueItem[];
  postureDimensions: SecurityPostureDimension[];
  attackOrigins: any[];
}

export function generateExecutiveReportMarkdown(input: ReportInput): string {
  const timestamp = new Date().toUTCString();
  const overallPosture = Math.round(
    input.postureDimensions.reduce((sum, d) => sum + d.current, 0) / (input.postureDimensions.length || 1)
  );
  const overallBenchmark = Math.round(
    input.postureDimensions.reduce((sum, d) => sum + d.benchmark, 0) / (input.postureDimensions.length || 1)
  );

  const criticalAssets = input.assets.filter(a => a.riskScore >= 75 || a.criticalVulnerabilities >= 2);
  const criticalVulns = input.vulnerabilities.filter(v => v.cvssScore >= 9.0);

  return `# 🛡️ Executive Cybersecurity Telemetry & Threat Intelligence Briefing

**Generated On**: ${timestamp}  
**Classification**: CONFIDENTIAL // SOC-TIER-3-EYES-ONLY  
**Evaluation Period**: Last ${input.timeRange.toUpperCase()}  
**Enterprise Posture Index**: **${overallPosture}/100** (*Benchmark: ${overallBenchmark}/100 | Delta: +${overallPosture - overallBenchmark} pts*)

---

## 1. Executive Summary & Key Threat Highlights
- **Total Inbound Security Events Intercepted**: ${input.totalThreats.toLocaleString()} events
- **Critical Severity Alerts**: ${input.criticalCount} (Immediate SOC engagement)
- **High Severity Detections**: ${input.highCount}
- **High-Risk Crown-Jewel Assets in Q1 Risk Zone**: ${criticalAssets.length} assets require priority containment.
- **Critical Zero-Day / High CVSS CVEs**: ${criticalVulns.length} vulnerabilities with CVSS ≥ 9.0.

---

## 2. Enterprise Security Posture Dimensions (CIS / NIST CSF 2.0)
| Security Domain | Organization Score | Peer Benchmark | Posture Delta | Status |
| :--- | :---: | :---: | :---: | :---: |
${input.postureDimensions.map(d => `| ${d.axis} | **${d.current}/100** | ${d.benchmark}/100 | ${d.current - d.benchmark >= 0 ? `+${d.current - d.benchmark}` : d.current - d.benchmark} pts | \`${d.status.toUpperCase()}\` |`).join('\n')}

---

## 3. Top MITRE ATT&CK® Enterprise Techniques Observed
| Technique ID | Technique Name | MITRE Tactic | Detections | Severity |
| :--- | :--- | :--- | :---: | :---: |
${input.mitreTechniques.slice(0, 8).map(t => `| \`${t.id}\` | ${t.name} | ${t.tactic} | ${t.count.toLocaleString()} | \`${t.severity.toUpperCase()}\` |`).join('\n')}

---

## 4. Crown-Jewel Assets at Highest Risk
| Asset ID | Asset Name | Subnet / IP | Department | Likelihood | Impact | FAIR Risk Score |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
${criticalAssets.slice(0, 6).map(a => `| \`${a.id}\` | ${a.name} | \`${a.ip}\` | ${a.department} | ${a.likelihood}% | ${a.impact}% | **${a.riskScore}/100** |`).join('\n')}

---

## 5. Geopolitical Inbound Attack Origins
${input.attackOrigins.slice(0, 5).map((c, i) => `${i + 1}. **${c.name || c.country} (${c.code})**: ${c.count?.toLocaleString()} intrusion attempts (${c.share ?? c.percentage}% global share)`).join('\n')}

---

## 6. Strategic CISO & SOC Remediation Playbook
1. **Immediate Patching**: Roll out vendor hotfixes for unauthenticated RCE on Core DB cluster and Auth Gateway within 48-hour SLA.
2. **Credential Hardening**: Enforce phishing-resistant FIDO2 hardware keys across all administrative SSO identities to mitigate \`T1078 Valid Accounts\`.
3. **Subnet Microsegmentation**: Quarantine Developer Staging cluster from Production DB subnet via zero-trust network access (ZTNA) policies.
4. **SOAR Automation**: Enable automated host isolation playbooks on endpoints displaying rapid file encryption heuristics (\`T1486\`).

---
*Report automatically compiled and certified by Unified SOC Analytics Intelligence Engine.*
`;
}

export function downloadExecutiveReport(input: ReportInput, format: 'markdown' | 'json' = 'markdown') {
  if (format === 'json') {
    const jsonContent = JSON.stringify(input, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-soc-report-${input.timeRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const markdownContent = generateExecutiveReportMarkdown(input);
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `executive-soc-report-${input.timeRange}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
