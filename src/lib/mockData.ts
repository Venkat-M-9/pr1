// ─── Mock Data Generator ────────────────────────────────────────────────────
// Generates deterministic large datasets for Challenge 1

export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Category = 'alpha' | 'beta' | 'gamma' | 'delta' | 'epsilon';

export interface Record {
  id: string;
  name: string;
  status: Status;
  priority: Priority;
  category: Category;
  owner: string;
  createdAt: string;
  updatedAt: string;
  value: number;
  progress: number;
  tags: string[];
  description: string;
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
  amount: number;
  currency: string;
  date: string;
  reference: string;
  notes: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  category: Category;
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
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const CATEGORIES: Category[] = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
const OWNERS = ['Alice Chen', 'Bob Martin', 'Carol White', 'David Kim', 'Eva Rossi', 'Frank Liu', 'Grace Park', 'Henry Scott'];
const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Support', 'Finance', 'HR'];
const ROLES = ['Admin', 'Editor', 'Viewer', 'Manager', 'Analyst', 'Developer'];
const TAGS_POOL = ['urgent', 'review', 'blocked', 'approved', 'draft', 'final', 'qa', 'prod', 'staging', 'archived'];
const SUPPLIERS = ['Acme Corp', 'GlobalTech', 'NexaSupply', 'ProSource', 'TechMart'];
const UNITS = ['pcs', 'kg', 'ltr', 'box', 'set'];
const ENTRY_TYPES = ['invoice', 'receipt', 'credit', 'debit', 'transfer'];

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
    const tagCount = Math.floor(r() * 3);
    for (let t = 0; t < tagCount; t++) tags.push(pick(TAGS_POOL, r));
    return {
      id: `REC-${id}`,
      name: `Record ${id}`,
      status: pick(STATUSES, r),
      priority: pick(PRIORITIES, r),
      category: pick(CATEGORIES, r),
      owner: pick(OWNERS, r),
      createdAt: formatDate(Math.floor(r() * 365)),
      updatedAt: formatDate(Math.floor(r() * 365) + 365),
      value: Math.round(r() * 100000) / 100,
      progress: Math.round(r() * 100),
      tags,
      description: `This is a description for record ${id}. It contains relevant context.`,
    };
  });
}

export function generateMembers(count = 500): Member[] {
  const r = seededRandom(99);
  const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 'Karen', 'Liam'];
  const lastNames = ['Chen', 'Martin', 'White', 'Kim', 'Rossi', 'Liu', 'Park', 'Scott', 'Brown', 'Davis', 'Wilson', 'Moore'];
  return Array.from({ length: count }, (_, i) => {
    const fn = pick(firstNames, r);
    const ln = pick(lastNames, r);
    const id = String(i + 1).padStart(4, '0');
    return {
      id: `MEM-${id}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      role: pick(ROLES, r),
      department: pick(DEPARTMENTS, r),
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
  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
  return Array.from({ length: count }, (_, i) => {
    const id = String(i + 1).padStart(5, '0');
    return {
      id: `ENT-${id}`,
      title: `Entry ${id}`,
      type: pick(ENTRY_TYPES, r),
      status: pick(STATUSES, r),
      amount: Math.round(r() * 50000) / 100,
      currency: pick(currencies, r),
      date: formatDate(Math.floor(r() * 365)),
      reference: `REF-${String(Math.floor(r() * 999999)).padStart(6, '0')}`,
      notes: `Note for entry ${id}`,
    };
  });
}

export function generateItems(count = 2000): Item[] {
  const r = seededRandom(13);
  const names = ['Widget', 'Gadget', 'Component', 'Module', 'Device', 'Tool', 'Accessory', 'Part'];
  return Array.from({ length: count }, (_, i) => {
    const id = String(i + 1).padStart(5, '0');
    const name = `${pick(names, r)} ${id}`;
    return {
      id: `ITM-${id}`,
      name,
      sku: `SKU-${String(Math.floor(r() * 999999)).padStart(6, '0')}`,
      category: pick(CATEGORIES, r),
      status: pick(STATUSES, r),
      quantity: Math.floor(r() * 1000),
      unit: pick(UNITS, r),
      price: Math.round(r() * 9999) / 100,
      supplier: pick(SUPPLIERS, r),
      lastUpdated: formatDate(Math.floor(r() * 365)),
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

export function aggregateByCategory(records: Record[]): { category: string; count: number; value: number }[] {
  const map = new Map<string, { count: number; value: number }>();
  records.forEach(r => {
    const existing = map.get(r.category) || { count: 0, value: 0 };
    map.set(r.category, { count: existing.count + 1, value: existing.value + r.value });
  });
  return Array.from(map.entries()).map(([category, data]) => ({ category, ...data }));
}

export function aggregateByPriority(records: Record[]): { priority: string; count: number }[] {
  const map = new Map<string, number>();
  records.forEach(r => map.set(r.priority, (map.get(r.priority) || 0) + 1));
  return Array.from(map.entries()).map(([priority, count]) => ({ priority, count }));
}
