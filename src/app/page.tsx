'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import SummaryCard from '@/components/ui/SummaryCard';
import ChartCard from '@/components/charts/ChartCard';
import DataTable from '@/components/table/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { generateRecords, aggregateByMonth, aggregateByStatus } from '@/lib/mockData';
import { ColumnDef } from '@tanstack/react-table';
import { Database, Activity, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage() {
  const records = useMemo(() => generateRecords(100), []);
  const monthlyData = useMemo(() => aggregateByMonth(records), [records]);
  const statusData = useMemo(() => aggregateByStatus(records), [records]);

  const activeCount = useMemo(() => records.filter(r => r.status === 'active').length, [records]);
  const pendingCount = useMemo(() => records.filter(r => r.status === 'pending').length, [records]);
  const totalValue = useMemo(() => records.reduce((acc, r) => acc + r.value, 0), [records]);

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'ID', size: 90 },
    { accessorKey: 'name', header: 'Record Name', size: 160 },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => <StatusBadge value={info.getValue()} variant="status" />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: info => <StatusBadge value={info.getValue()} variant="priority" />,
    },
    { accessorKey: 'owner', header: 'Owner' },
    {
      accessorKey: 'value',
      header: 'Value ($)',
      cell: info => `$${info.getValue().toLocaleString()}`,
    },
  ];

  return (
    <PageShell
      title="System Overview"
      description="Real-time operational summary and quick access to core workflows."
      breadcrumbs={[{ label: 'Home' }]}
    >
      <div className={styles.container}>
        {/* Metric Cards Grid */}
        <div className={styles.grid4}>
          <SummaryCard
            title="Total Records"
            value="5,000"
            subtitle="Virtual dataset ready"
            icon={<Database size={18} />}
            trend={{ value: 12, label: 'vs last month' }}
          />
          <SummaryCard
            title="Active Entities"
            value={activeCount.toString()}
            subtitle="Operational"
            icon={<CheckCircle size={18} />}
            trend={{ value: 4, label: 'vs last week' }}
          />
          <SummaryCard
            title="Pending Review"
            value={pendingCount.toString()}
            subtitle="Action needed"
            icon={<AlertTriangle size={18} />}
            trend={{ value: -8, label: 'vs yesterday' }}
          />
          <SummaryCard
            title="Aggregate Value"
            value={`$${(totalValue / 1000).toFixed(1)}k`}
            subtitle="In portfolio"
            icon={<Activity size={18} />}
            trend={{ value: 15, label: 'growth' }}
          />
        </div>

        {/* Charts Row */}
        <div className={styles.grid2}>
          <ChartCard
            title="Record Creation Velocity"
            subtitle="Monthly generation trend across system dataset"
            data={monthlyData}
            dataKey="count"
            categoryKey="month"
            type="area"
          />
          <ChartCard
            title="Status Distribution"
            subtitle="Current record breakdown by operational state"
            data={statusData}
            dataKey="count"
            categoryKey="status"
            type="pie"
          />
        </div>

        {/* Recent Records Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Recent Activity Stream</h2>
              <p className={styles.sectionSubtitle}>Latest records registered in the master index</p>
            </div>
          </div>
          <DataTable data={records.slice(0, 8)} columns={columns} />
        </div>
      </div>
    </PageShell>
  );
}
