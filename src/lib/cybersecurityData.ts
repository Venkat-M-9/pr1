import {
  ThreatSeverity,
  SecurityAsset,
  VulnerabilityItem,
  SecurityIncident,
  AttackSourceCountry,
  MitreTechniqueItem,
  SecurityPostureDimension,
  TimeSeriesThreatPoint,
  IncidentTimelinePoint,
} from '@/types/cybersecurity';

// ─── 1. Threat Types & MITRE Framework Reference Data ────────────────────────
export const THREAT_TYPES = [
  { type: 'Ransomware', tactic: 'Impact', techniqueId: 'T1486', techniqueName: 'Data Encrypted for Impact', defaultSev: 'critical' as ThreatSeverity },
  { type: 'Zero-Day Exploit', tactic: 'Initial Access', techniqueId: 'T1190', techniqueName: 'Exploit Public-Facing Application', defaultSev: 'critical' as ThreatSeverity },
  { type: 'Credential Dumping', tactic: 'Credential Access', techniqueId: 'T1003', techniqueName: 'OS Credential Dumping', defaultSev: 'high' as ThreatSeverity },
  { type: 'SQL Injection', tactic: 'Initial Access', techniqueId: 'T1190', techniqueName: 'Exploit Public-Facing Application', defaultSev: 'high' as ThreatSeverity },
  { type: 'Phishing', tactic: 'Initial Access', techniqueId: 'T1566', techniqueName: 'Phishing: Spearphishing Link', defaultSev: 'high' as ThreatSeverity },
  { type: 'Command & Control', tactic: 'Command and Control', techniqueId: 'T1071', techniqueName: 'Application Layer Protocol', defaultSev: 'high' as ThreatSeverity },
  { type: 'Malware Execution', tactic: 'Execution', techniqueId: 'T1059.001', techniqueName: 'PowerShell Execution', defaultSev: 'medium' as ThreatSeverity },
  { type: 'Brute Force Auth', tactic: 'Credential Access', techniqueId: 'T1110', techniqueName: 'Brute Force: Password Guessing', defaultSev: 'medium' as ThreatSeverity },
  { type: 'DDoS Amplification', tactic: 'Impact', techniqueId: 'T1498', techniqueName: 'Network Denial of Service', defaultSev: 'medium' as ThreatSeverity },
  { type: 'Man-in-the-Middle', tactic: 'Collection', techniqueId: 'T1557', techniqueName: 'Adversary-in-the-Middle', defaultSev: 'low' as ThreatSeverity },
  { type: 'Port Scanning', tactic: 'Reconnaissance', techniqueId: 'T1046', techniqueName: 'Network Service Discovery', defaultSev: 'low' as ThreatSeverity },
];

export const COUNTRIES = [
  { country: 'United States', code: 'US', weight: 0.28, primaryThreat: 'Phishing' },
  { country: 'China', code: 'CN', weight: 0.22, primaryThreat: 'Zero-Day Exploit' },
  { country: 'Russia', code: 'RU', weight: 0.18, primaryThreat: 'Ransomware' },
  { country: 'Brazil', code: 'BR', weight: 0.08, primaryThreat: 'Brute Force Auth' },
  { country: 'Germany', code: 'DE', weight: 0.06, primaryThreat: 'SQL Injection' },
  { country: 'India', code: 'IN', weight: 0.05, primaryThreat: 'DDoS Amplification' },
  { country: 'Netherlands', code: 'NL', weight: 0.04, primaryThreat: 'Command & Control' },
  { country: 'United Kingdom', code: 'GB', weight: 0.04, primaryThreat: 'Malware Execution' },
  { country: 'Singapore', code: 'SG', weight: 0.03, primaryThreat: 'Port Scanning' },
  { country: 'Vietnam', code: 'VN', weight: 0.02, primaryThreat: 'Credential Dumping' },
];

export const ASSET_DEFINITIONS: Omit<SecurityAsset, 'id' | 'riskScore' | 'status'>[] = [
  { name: 'Core DB Cluster (PostgreSQL)', type: 'Database', ip: '10.0.4.12', department: 'Data Infrastructure', likelihood: 82, impact: 95, vulnerabilityCount: 14, criticalVulnerabilities: 4 },
  { name: 'Primary Auth Gateway', type: 'API Gateway', ip: '10.0.1.1', department: 'Platform Engineering', likelihood: 75, impact: 92, vulnerabilityCount: 11, criticalVulnerabilities: 3 },
  { name: 'Production Kubernetes Node-01', type: 'Kubernetes Cluster', ip: '10.0.2.10', department: 'DevOps & SRE', likelihood: 68, impact: 88, vulnerabilityCount: 9, criticalVulnerabilities: 2 },
  { name: 'Customer Payment Microservice', type: 'Server', ip: '10.0.3.50', department: 'Financial Operations', likelihood: 58, impact: 96, vulnerabilityCount: 8, criticalVulnerabilities: 3 },
  { name: 'Corporate S3 Archive Bucket', type: 'Storage', ip: '10.0.8.20', department: 'Enterprise Security', likelihood: 42, impact: 85, vulnerabilityCount: 5, criticalVulnerabilities: 1 },
  { name: 'Edge Load Balancer (Nginx)', type: 'Server', ip: '192.168.1.100', department: 'Network Operations', likelihood: 85, impact: 70, vulnerabilityCount: 12, criticalVulnerabilities: 2 },
  { name: 'Executive Workstation (Mac-04)', type: 'Endpoint', ip: '172.16.10.4', department: 'Executive Suite', likelihood: 72, impact: 65, vulnerabilityCount: 7, criticalVulnerabilities: 1 },
  { name: 'Enterprise VPN Gateway', type: 'API Gateway', ip: '192.168.0.1', department: 'IT Operations', likelihood: 60, impact: 78, vulnerabilityCount: 6, criticalVulnerabilities: 1 },
  { name: 'Analytics Data Warehouse (Snowflake)', type: 'Cloud Resource', ip: '10.0.6.80', department: 'Business Intelligence', likelihood: 35, impact: 82, vulnerabilityCount: 4, criticalVulnerabilities: 0 },
  { name: 'Developer Staging Cluster', type: 'Kubernetes Cluster', ip: '10.0.9.15', department: 'Software Engineering', likelihood: 90, impact: 40, vulnerabilityCount: 18, criticalVulnerabilities: 2 },
  { name: 'Internal HR Portal Server', type: 'Server', ip: '10.0.5.12', department: 'Human Resources', likelihood: 45, impact: 55, vulnerabilityCount: 3, criticalVulnerabilities: 0 },
  { name: 'Customer Support Desk VM', type: 'Endpoint', ip: '172.16.20.18', department: 'Customer Success', likelihood: 52, impact: 48, vulnerabilityCount: 4, criticalVulnerabilities: 0 },
];

export const VULNERABILITY_CATALOG: Omit<VulnerabilityItem, 'id' | 'affectedAsset'>[] = [
  {
    title: 'Arbitrary Code Execution in Web Management Interface',
    severity: 'critical',
    cvssScore: 9.8,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    affectedComponent: 'HTTP Gateway Server 4.2',
    cwe: 'CWE-94 (Improper Control of Code Generation)',
    publishedDate: '2024-04-12',
    patchAvailable: true,
    description: 'An unauthenticated remote attacker can inject shell parameters leading to root remote code execution.',
    remediation: 'Upgrade to firmware version 4.2.1-hotfix or disable external management access.',
  },
  {
    title: 'SQL Injection in Session Authentication Endpoint',
    severity: 'critical',
    cvssScore: 9.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
    affectedComponent: 'Auth Service v2.8',
    cwe: 'CWE-89 (SQL Injection)',
    publishedDate: '2024-05-02',
    patchAvailable: true,
    description: 'Improper input sanitation in user token header enables database exfiltration and admin bypass.',
    remediation: 'Apply prepared parameterized queries and update ORM dependency.',
  },
  {
    title: 'Kernel Privilege Escalation via Namespace Race Condition',
    severity: 'high',
    cvssScore: 8.4,
    cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
    affectedComponent: 'Linux Kernel 5.15 LTS',
    cwe: 'CWE-362 (Race Condition)',
    publishedDate: '2024-03-18',
    patchAvailable: true,
    description: 'Local unprivileged users can trigger a use-after-free race condition to gain root privileges on the node.',
    remediation: 'Reboot with patched kernel 5.15.0-107-generic.',
  },
  {
    title: 'Cross-Site Scripting (Stored) in Admin Audit Log Viewer',
    severity: 'medium',
    cvssScore: 6.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
    affectedComponent: 'Admin Web Console',
    cwe: 'CWE-79 (Improper Neutralization of Input)',
    publishedDate: '2024-02-28',
    patchAvailable: true,
    description: 'Malicious user agents in logs are rendered unescaped in dashboard causing credential theft.',
    remediation: 'Enable DOMPurify HTML escaping across all log rendering widgets.',
  },
  {
    title: 'Insecure Direct Object Reference in Billing Invoices API',
    severity: 'high',
    cvssScore: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N',
    affectedComponent: 'Billing Microservice',
    cwe: 'CWE-639 (Authorization Bypass Through IDOR)',
    publishedDate: '2024-01-15',
    patchAvailable: false,
    description: 'Authenticated tenants can retrieve invoice PDFs of adjacent accounts by modifying the UUID parameter.',
    remediation: 'Enforce tenant-level authorization checks before returning invoice objects.',
  },
  {
    title: 'Unauthenticated Denial of Service via Regex ReDoS in Header Parsing',
    severity: 'medium',
    cvssScore: 5.3,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L',
    affectedComponent: 'Nginx Ingress Controller',
    cwe: 'CWE-1333 (Inefficient Regular Expression Complexity)',
    publishedDate: '2024-03-05',
    patchAvailable: true,
    description: 'Specially crafted Authorization headers cause exponential CPU backtracking locking worker processes.',
    remediation: 'Update ingress controller to version 1.9.4.',
  },
  {
    title: 'Information Disclosure via Verbose Stack Traces in 500 Responses',
    severity: 'low',
    cvssScore: 3.7,
    cvssVector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N',
    affectedComponent: 'Node.js Backend Gateway',
    cwe: 'CWE-209 (Information Exposure Through an Error Message)',
    publishedDate: '2024-01-20',
    patchAvailable: true,
    description: 'Database connection strings and internal paths are printed in unhandled exception responses.',
    remediation: 'Set NODE_ENV=production and configure generic error response middleware.',
  },
];

// ─── 2. Deterministic Telemetry Generators ───────────────────────────────────

export function getSecurityAssets(): SecurityAsset[] {
  return ASSET_DEFINITIONS.map((asset, index) => {
    // Composite Risk Score: (Likelihood * 0.45) + (Impact * 0.55)
    const riskScore = Math.round(asset.likelihood * 0.45 + asset.impact * 0.55);
    const status: SecurityAsset['status'] =
      riskScore >= 75 || asset.criticalVulnerabilities >= 3
        ? 'compromised'
        : riskScore >= 50 || asset.criticalVulnerabilities >= 1
        ? 'warning'
        : 'secure';

    return {
      ...asset,
      id: `AST-${1000 + index}`,
      riskScore,
      status,
    };
  });
}

export function getVulnerabilities(assets: SecurityAsset[] = getSecurityAssets()): VulnerabilityItem[] {
  const list: VulnerabilityItem[] = [];
  let cveCounter = 3400;

  assets.forEach(asset => {
    const count = Math.min(asset.vulnerabilityCount, VULNERABILITY_CATALOG.length);
    for (let i = 0; i < count; i++) {
      const template = VULNERABILITY_CATALOG[i % VULNERABILITY_CATALOG.length];
      list.push({
        ...template,
        id: `CVE-2024-${cveCounter++}`,
        affectedAsset: asset.name,
      });
    }
  });

  return list;
}

export function getAttackSourceCountries(): AttackSourceCountry[] {
  const totalAttacks = 8450;
  return COUNTRIES.map(c => {
    const count = Math.round(totalAttacks * c.weight);
    const criticalCount = Math.round(count * (c.weight > 0.15 ? 0.35 : 0.15));
    const percentage = Math.round((count / totalAttacks) * 100);
    return {
      country: c.country,
      code: c.code,
      count,
      criticalCount,
      percentage,
      primaryThreat: c.primaryThreat,
    };
  });
}

export function getMitreTechniques(): MitreTechniqueItem[] {
  return [
    { id: 'T1059.001', name: 'PowerShell Execution', tactic: 'Execution', count: 1420, severity: 'high', description: 'Adversaries may abuse PowerShell commands and scripts for execution.' },
    { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion', count: 1180, severity: 'critical', description: 'Adversaries may steal credentials to bypass access controls.' },
    { id: 'T1566', name: 'Phishing Links', tactic: 'Initial Access', count: 960, severity: 'high', description: 'Adversaries send malicious links via emails to gain initial foothold.' },
    { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access', count: 850, severity: 'critical', description: 'Adversaries dump credentials from memory (LSASS/SAM).' },
    { id: 'T1190', name: 'Exploit Public App', tactic: 'Initial Access', count: 740, severity: 'critical', description: 'Adversaries exploit software vulnerabilities in web-facing systems.' },
    { id: 'T1055', name: 'Process Injection', tactic: 'Privilege Escalation', count: 620, severity: 'high', description: 'Adversaries inject code into running processes to evade detection.' },
    { id: 'T1071', name: 'App Layer Protocol (C2)', tactic: 'Command and Control', count: 530, severity: 'medium', description: 'Adversaries communicate using HTTPS/DNS protocol wrappers.' },
    { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', count: 480, severity: 'critical', description: 'Adversaries encrypt data on target systems to disrupt operations.' },
    { id: 'T1110', name: 'Brute Force Auth', tactic: 'Credential Access', count: 410, severity: 'medium', description: 'Automated password spray against SSO endpoints.' },
    { id: 'T1046', name: 'Network Service Discovery', tactic: 'Reconnaissance', count: 320, severity: 'low', description: 'Adversaries attempt to enumerate accessible services and ports.' },
  ];
}

export function getSecurityPostureMetrics(): SecurityPostureDimension[] {
  return [
    { axis: 'Threat Exposure', current: 78, benchmark: 65, fullMark: 100, status: 'warning', description: 'Rate of inbound exploits and targeted malware.' },
    { axis: 'Vulnerability Risk', current: 82, benchmark: 58, fullMark: 100, status: 'critical', description: 'Unpatched CVE density across crown-jewel assets.' },
    { axis: 'Incident Risk', current: 65, benchmark: 70, fullMark: 100, status: 'good', description: 'Mean Time to Contain (MTTC) active security breaches.' },
    { axis: 'Authentication Risk', current: 88, benchmark: 75, fullMark: 100, status: 'good', description: 'MFA enforcement and zero-trust policy compliance.' },
    { axis: 'Network Risk', current: 72, benchmark: 68, fullMark: 100, status: 'warning', description: 'Segmented subnet boundary violations and lateral movement.' },
    { axis: 'Data Risk', current: 85, benchmark: 60, fullMark: 100, status: 'good', description: 'DLP triggers, database encryption, and egress exfiltration.' },
    { axis: 'Compliance Score', current: 91, benchmark: 80, fullMark: 100, status: 'good', description: 'SOC2 Type II, ISO 27001, and NIST 800-53 adherence.' },
  ];
}

export function getSecurityIncidents(): SecurityIncident[] {
  return [
    {
      id: 'INC-2024-8812',
      title: 'Active Ransomware Payload Dropped via Phishing Email',
      severity: 'critical',
      status: 'investigating',
      assignee: 'Sarah Connor (Tier 3 SOC Lead)',
      affectedAsset: 'Core DB Cluster (PostgreSQL)',
      threatType: 'Ransomware',
      detectionTime: '2024-05-18 14:22:10',
      timeline: [
        { timestamp: '14:22:10', note: 'EDR heuristic alert triggered for LockBit signature on worker host.', status: 'open' },
        { timestamp: '14:28:45', note: 'SOC Analyst isolated affected node from internal subnet.', status: 'investigating' },
        { timestamp: '14:45:00', note: 'Memory dump captured; reverse engineering payload decryptor.', status: 'investigating' },
      ],
    },
    {
      id: 'INC-2024-8809',
      title: 'SQL Injection Auth Bypass on Main API Gateway',
      severity: 'critical',
      status: 'contained',
      assignee: 'Alex Murphy (Application Security)',
      affectedAsset: 'Primary Auth Gateway',
      threatType: 'SQL Injection',
      detectionTime: '2024-05-17 09:15:30',
      timeline: [
        { timestamp: '09:15:30', note: 'WAF detected repeated boolean-based SQL injection probes.', status: 'open' },
        { timestamp: '09:20:00', note: 'Rate limiting and Cloudflare IP block rule applied.', status: 'contained' },
      ],
    },
    {
      id: 'INC-2024-8801',
      title: 'Volumetric SYN Flood Against Load Balancer',
      severity: 'high',
      status: 'resolved',
      assignee: 'Elena Rostova (Network Security)',
      affectedAsset: 'Edge Load Balancer (Nginx)',
      threatType: 'DDoS Amplification',
      detectionTime: '2024-05-15 03:40:12',
      resolvedTime: '2024-05-15 04:30:00',
      timeline: [
        { timestamp: '03:40:12', note: 'Inbound traffic spiked past 45 Gbps.', status: 'open' },
        { timestamp: '03:48:00', note: 'Anycast scrubbing activated across Tier 1 upstream providers.', status: 'contained' },
        { timestamp: '04:30:00', note: 'Traffic normalized; zero downtime on customer endpoints.', status: 'resolved' },
      ],
    },
    {
      id: 'INC-2024-8794',
      title: 'Multiple Failed Kerberos Pre-Auths on Staging Cluster',
      severity: 'medium',
      status: 'open',
      assignee: 'Marcus Vance (Identity Team)',
      affectedAsset: 'Developer Staging Cluster',
      threatType: 'Brute Force Auth',
      detectionTime: '2024-05-18 11:05:00',
      timeline: [
        { timestamp: '11:05:00', note: 'Over 1,200 password attempts against 40 staging accounts.', status: 'open' },
      ],
    },
    {
      id: 'INC-2024-8789',
      title: 'Suspected Cobalt Strike Beaconing to Unknown External IP',
      severity: 'high',
      status: 'investigating',
      assignee: 'David King (Threat Hunting)',
      affectedAsset: 'Executive Workstation (Mac-04)',
      threatType: 'Command & Control',
      detectionTime: '2024-05-17 19:50:00',
      timeline: [
        { timestamp: '19:50:00', note: 'Jittered HTTPS beacons to ASN 45102 identified by Zeek sensor.', status: 'open' },
        { timestamp: '20:10:00', note: 'Endpoint quarantined via CrowdStrike agent.', status: 'investigating' },
      ],
    },
  ];
}

// ─── 3. Time Series Threat Trends (24h, 7d, 30d) ─────────────────────────────

export function getThreatTrends(timeRange: '24h' | '7d' | '30d'): TimeSeriesThreatPoint[] {
  if (timeRange === '24h') {
    // 24 hours -> hourly points
    return Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      const critical = Math.floor(Math.sin((i / 24) * Math.PI * 2) * 5 + 8 + (i % 3));
      const high = Math.floor(Math.cos((i / 24) * Math.PI * 2) * 10 + 18 + (i % 4));
      const medium = Math.floor(15 + Math.random() * 8 + (i % 5));
      const low = Math.floor(25 + Math.random() * 12);
      return {
        timeLabel: hour,
        timestamp: hour,
        critical: Math.max(1, critical),
        high: Math.max(4, high),
        medium: Math.max(8, medium),
        low: Math.max(12, low),
        total: critical + high + medium + low,
      };
    });
  }

  if (timeRange === '7d') {
    // 7 days -> daily points
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const critical = Math.floor(18 + Math.sin(i) * 8 + (i === 3 ? 15 : 0));
      const high = Math.floor(45 + Math.cos(i) * 14 + (i === 4 ? 20 : 0));
      const medium = Math.floor(65 + Math.random() * 15);
      const low = Math.floor(95 + Math.random() * 25);
      return {
        timeLabel: day,
        timestamp: `Day ${i + 1}`,
        critical,
        high,
        medium,
        low,
        total: critical + high + medium + low,
      };
    });
  }

  // 30 days -> daily / weekly points (4 weeks)
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map((week, i) => {
    const critical = 120 + i * 25 + Math.floor(Math.random() * 20);
    const high = 340 + i * 40 + Math.floor(Math.random() * 30);
    const medium = 580 + i * 50 + Math.floor(Math.random() * 40);
    const low = 820 + i * 60 + Math.floor(Math.random() * 50);
    return {
      timeLabel: week,
      timestamp: week,
      critical,
      high,
      medium,
      low,
      total: critical + high + medium + low,
    };
  });
}

// ─── 4. Incident Status Trends ───────────────────────────────────────────────

export function getIncidentTrends(): IncidentTimelinePoint[] {
  const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return periods.map((period, i) => {
    const open = Math.floor(12 + Math.random() * 6);
    const investigating = Math.floor(18 + Math.random() * 8);
    const contained = Math.floor(25 + Math.random() * 10);
    const resolved = Math.floor(45 + i * 12 + Math.random() * 8);
    return {
      timeLabel: period,
      timestamp: period,
      open,
      investigating,
      contained,
      resolved,
      total: open + investigating + contained + resolved,
    };
  });
}
