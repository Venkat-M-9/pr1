// ─── Cybersecurity Master Telemetry & Record Generator ───────────────────────
// Generates realistic security assets, vulnerability telemetry, and audit logs

export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Record {
  id: string;
  name: string;
  status: Status;
  priority: Priority;
  owner: string;
  createdAt: string;
  updatedAt: string;
  value: number; // Represents Composite Threat Risk Score (0 - 100)
  progress: number; // Represents Remediation Progress (0 - 100%)
  tags: string[];
  description: string;
  starred?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: Status;
  joinedAt: string;
  lastActive: string;
  tasks: number;
  avatar: string;
}

export interface Entry {
  id: string;
  title: string;
  type: string;
  status: Status;
  amount: number; // Threat Event Severity / Impact Score (0 - 100)
  currency: string; // Sensor / Ingestion Protocol (e.g. 'SIEM', 'EDR', 'WAF', 'ZEEK')
  date: string;
  reference: string;
  notes: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  status: Status;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  lastUpdated: string;
}

// Seeded pseudo-random (deterministic)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const STATUSES: Status[] = ['active', 'inactive', 'pending', 'archived'];
const SOC_ANALYSTS = [
  'Sarah Connor (SOC Lead)',
  'Alex Murphy (AppSec)',
  'Elena Rostova (NetSec)',
  'David King (Threat Hunting)',
  'Marcus Vance (Identity)',
  'Alice Chen (SecOps)',
  'Frank Liu (DevSecOps)',
  'Eva Rossi (Incident Response)',
];
const SOC_DEPARTMENTS = [
  'SOC Operations',
  'Application Security',
  'Cloud Infrastructure',
  'Network Security',
  'Identity & Access',
  'Threat Intelligence',
  'DevSecOps',
  'Compliance & Risk',
];
const ROLES = ['Tier 3 Lead', 'SOC Analyst', 'SecOps Engineer', 'Threat Hunter', 'Security Architect', 'Compliance Auditor'];
const CYBER_TAGS_POOL = [
  'cve-critical',
  'rce-exploit',
  'zero-trust',
  'pci-dss',
  'soc2-type2',
  'mitre-t1190',
  'edr-active',
  'quarantined',
  'patch-pending',
  'crown-jewel',
  'waf-blocked',
  'mfa-enforced',
];

const SECURITY_ASSET_TEMPLATES = [
  { prefix: 'Core PostgreSQL DB Cluster', desc: 'Production database cluster hosting customer financial & PII records.' },
  { prefix: 'Primary Auth & OAuth Gateway', desc: 'Zero-trust perimeter ingress enforcing JWT token validation.' },
  { prefix: 'Kubernetes Worker Node', desc: 'Core container orchestration node hosting live microservices.' },
  { prefix: 'Corporate S3 Archive Bucket', desc: 'Encrypted cloud storage hosting historical database backups.' },
  { prefix: 'Edge Nginx Ingress Proxy', desc: 'Frontline load balancer managing TLS termination and DDoS mitigation.' },
  { prefix: 'Executive Endpoint (MacBook)', desc: 'Corporate workstation with privileged administration certificates.' },
  { prefix: 'Enterprise Global VPN Gateway', desc: 'IPSec access concentrator routing internal developer traffic.' },
  { prefix: 'Billing Microservice API', desc: 'Payment processor handling cardholder transactions and webhooks.' },
  { prefix: 'Active Directory Domain Controller', desc: 'Central identity repository managing Kerberos tickets & LDAP.' },
  { prefix: 'Redis In-Memory Session Cache', desc: 'High-throughput caching layer for authenticated session tokens.' },
  { prefix: 'Customer Support Desk VM', desc: 'Virtual machine operating customer ticketing & CRM workflows.' },
  { prefix: 'Developer Staging K8s Cluster', desc: 'Pre-production test environment with CI/CD pipeline deployments.' },
];

const DETECTION_TYPES = ['WAF Block', 'EDR Detection', 'Auth Anomaly', 'Port Scan Drop', 'DDoS Mitigation', 'Malware Quarantine', 'DLP Egress Alert'];
const SENSORS = ['SIEM', 'EDR', 'WAF', 'ZEEK', 'SNORT'];

export function getPriorityFromValue(riskScore: number): Priority {
  if (riskScore >= 75) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 25) return 'medium';
  return 'low';
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function formatDate(offset: number, base = new Date('2024-01-01')): string {
  const d = new Date(base.getTime() + offset * 86400000);
  return d.toISOString().split('T')[0];
}

export function generateRecords(count = 5000): Record[] {
  const r = seededRandom(42);
  return Array.from({ length: count }, (_, i) => {
    const id = String(i + 1).padStart(5, '0');
    const tags: string[] = [];
    const tagCount = Math.floor(r() * 3) + 1;
    for (let t = 0; t < tagCount; t++) tags.push(pick(CYBER_TAGS_POOL, r));
    
    // Generate realistic Composite Threat & Risk Score between 5 and 99
    const riskScore = Math.floor(r() * 95) + 5;
    const priority = getPriorityFromValue(riskScore);
    const template = pick(SECURITY_ASSET_TEMPLATES, r);
    const assetInstanceName = `${template.prefix} #${id.slice(-3)}`;

    return {
      id: `AST-${id}`,
      name: assetInstanceName,
      status: pick(STATUSES, r),
      priority,
      owner: pick(SOC_ANALYSTS, r),
      createdAt: formatDate(Math.floor(r() * 365)),
      updatedAt: formatDate(Math.floor(r() * 365) + 365),
      value: riskScore,
      progress: Math.round(r() * 100),
      tags,
      description: `${template.desc} Current risk score evaluation: ${riskScore}/100.`,
      starred: r() > 0.88,
    };
  });
}

export function generateMembers(count = 500): Member[] {
  const r = seededRandom(99);
  const firstNames = ['Sarah', 'Alex', 'Elena', 'David', 'Marcus', 'Alice', 'Frank', 'Eva', 'Grace', 'Henry', 'Iris', 'Jack'];
  const lastNames = ['Connor', 'Murphy', 'Rostova', 'King', 'Vance', 'Chen', 'Liu', 'Rossi', 'Park', 'Scott', 'Davis', 'Wilson'];
  return Array.from({ length: count }, (_, i) => {
    const fn = pick(firstNames, r);
    const ln = pick(lastNames, r);
    const id = String(i + 1).padStart(4, '0');
    return {
      id: `SOC-${id}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@cyberops.internal`,
      role: pick(ROLES, r),
      department: pick(SOC_DEPARTMENTS, r),
      status: pick(STATUSES, r),
      joinedAt: formatDate(Math.floor(r() * 730)),
      lastActive: formatDate(Math.floor(r() * 30) + 700),
      tasks: Math.floor(r() * 50),
      avatar: `${fn[0]}${ln[0]}`,
    };
  });
}

export function generateEntries(count = 3000): Entry[] {
  const r = seededRandom(7);
  return Array.from({ length: count }, (_, i) => {
    const id = String(i + 1).padStart(5, '0');
    const type = pick(DETECTION_TYPES, r);
    const severityScore = Math.floor(r() * 90) + 10;
    return {
      id: `LOG-${id}`,
      title: `${type} Telemetry Alert #${id}`,
      type,
      status: pick(STATUSES, r),
      amount: severityScore,
      currency: pick(SENSORS, r),
      date: formatDate(Math.floor(r() * 365)),
      reference: `CVE-2024-${String(Math.floor(r() * 8999) + 1000)}`,
      notes: `Automated ${type} detection captured via ${pick(SENSORS, r)} sensor cluster.`,
    };
  });
}

// Analytics aggregation helpers
export function aggregateByMonth(records: Record[]): { month: string; count: number; value: number }[] {
  const map = new Map<string, { count: number; value: number }>();
  records.forEach(r => {
    const month = r.createdAt.slice(0, 7);
    const existing = map.get(month) || { count: 0, value: 0 };
    map.set(month, { count: existing.count + 1, value: existing.value + r.value });
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export function aggregateByStatus(records: Record[]): { status: string; count: number }[] {
  const map = new Map<string, number>();
  records.forEach(r => map.set(r.status, (map.get(r.status) || 0) + 1));
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

export function aggregateByPriority(records: Record[]): { priority: string; count: number }[] {
  const map = new Map<string, number>();
  records.forEach(r => map.set(r.priority, (map.get(r.priority) || 0) + 1));
  return Array.from(map.entries()).map(([priority, count]) => ({ priority, count }));
}
