'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import SummaryCard from '@/components/ui/SummaryCard';
import ChartCard from '@/components/charts/ChartCard';
import DataTable from '@/components/table/DataTable';
import FilterBar from '@/components/ui/FilterBar';
import Drawer from '@/components/ui/Drawer';
import StatusBadge from '@/components/ui/StatusBadge';
import { useDataContext } from '@/context/DataContext';
import { aggregateByMonth, aggregateByStatus, Record as SystemRecord } from '@/lib/mockData';
import { useDebounce } from '@/lib/useDebounce';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { Database, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage() {
  // Access central reactive dataset from DataContext
  const { records } = useDataContext();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: '',
    priority: '',
  });

  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [selectedRecord, setSelectedRecord] = useState<SystemRecord | null>(null);

  // Live aggregated analytics calculated directly from shared dataset
  const monthlyData = useMemo(() => aggregateByMonth(records), [records]);
  const statusData = useMemo(() => aggregateByStatus(records), [records]);

  const activeCount = useMemo(() => records.filter(r => r.status === 'active').length, [records]);
  const pendingCount = useMemo(() => records.filter(r => r.status === 'pending').length, [records]);
  const totalValue = useMemo(() => records.reduce((acc, r) => acc + r.value, 0), [records]);

  // Filtered dataset for Home Page Activity Stream
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchOwner = item.owner.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchOwner) return false;
      }

      if (selectedFilters.status && item.status !== selectedFilters.status) return false;
      if (selectedFilters.priority && item.priority !== selectedFilters.priority) return false;

      return true;
    });
  }, [records, debouncedSearch, selectedFilters]);

  const columns = useMemo<ColumnDef<SystemRecord, any>[]>(
    () => [
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
    ],
    []
  );

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
  ];

  return (
    <PageShell
      title="System Overview"
      description="Real-time operational summary and quick access to core workflows."
      breadcrumbs={[{ label: 'Home' }]}
    >
      <div className={styles.container}>
        {/* Metric Cards Grid - Live accurate metrics from DataContext */}
        <div className={styles.grid4}>
          <SummaryCard
            title="Total Records"
            value={records.length.toLocaleString()}
            subtitle="Central dataset live"
            icon={<Database size={18} />}
            trend={{ value: 12, label: 'vs last month' }}
          />
          <SummaryCard
            title="Active Entities"
            value={activeCount.toLocaleString()}
            subtitle="Operational"
            icon={<CheckCircle size={18} />}
            trend={{ value: 4, label: 'vs last week' }}
          />
          <SummaryCard
            title="Pending Review"
            value={pendingCount.toLocaleString()}
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

        {/* Recent Records Section with FilterBar, managed sorting, and Drawer Detail View */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Activity Stream</h2>
              <p className={styles.sectionSubtitle}>
                Showing {filteredRecords.length.toLocaleString()} matching records from central index
              </p>
            </div>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search activity stream..."
            filters={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={(id, val) => setSelectedFilters(prev => ({ ...prev, [id]: val }))}
            onResetFilters={() => setSelectedFilters({ status: '', priority: '' })}
          />

          <DataTable
            data={filteredRecords}
            columns={columns}
            sorting={sorting}
            onSortingChange={setSorting}
            pageSize={10}
            onRowClick={record => setSelectedRecord(record)}
          />
        </div>

        {/* Detail View Drawer */}
        <Drawer
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord?.id || 'Record Details'}
        >
          {selectedRecord && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Title</span>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{selectedRecord.name}</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge value={selectedRecord.status} variant="status" />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority</span>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge value={selectedRecord.priority} variant="priority" />
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Owner</span>
                <p style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{selectedRecord.owner}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created At</span>
                  <p style={{ fontSize: 13, marginTop: 2 }}>{selectedRecord.createdAt}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated At</span>
                  <p style={{ fontSize: 13, marginTop: 2 }}>{selectedRecord.updatedAt}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Financial Value</span>
                <p style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>${selectedRecord.value.toLocaleString()}</p>
              </div>

              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Description</span>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
                  {selectedRecord.description}
                </p>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </PageShell>
  );
}
