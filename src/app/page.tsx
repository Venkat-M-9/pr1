'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import SummaryCard from '@/components/ui/SummaryCard';
import ChartCard from '@/components/charts/ChartCard';
import TopFlaggedCard from '@/components/ui/TopFlaggedCard';
import ResourceTable from '@/components/table/ResourceTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import RecordDetailView from '@/components/ui/RecordDetailView';
import EditRecordModal from '@/components/ui/EditRecordModal';
import BulkEditModal from '@/components/ui/BulkEditModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDataContext } from '@/context/DataContext';
import { Record as SystemRecord, Status, Priority } from '@/lib/mockData';
import { toast } from '@/lib/toast';
import { ColumnDef } from '@tanstack/react-table';
import { Database, Activity, CheckCircle, AlertTriangle, CheckSquare, Edit3, Trash2, DollarSign } from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage() {
  const { records, toggleStarRecord, updateRecord, deleteRecord, deleteRecords, updateRecords } = useDataContext();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingRecord, setEditingRecord] = useState<SystemRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SystemRecord | null>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // 100% Dynamic Metrics calculated directly from DataContext system records
  const activeCount = useMemo(() => records.filter(r => r.status === 'active').length, [records]);
  const highPriorityCount = useMemo(() => records.filter(r => r.priority === 'critical' || r.priority === 'high').length, [records]);
  const totalPortfolioValue = useMemo(() => records.reduce((acc, r) => acc + r.value, 0), [records]);

  // 100% Dynamic Priority Breakdown by Financial Value Tier for the Stacked Bar Chart
  const financialTierPriorityData = useMemo(() => {
    const tiers: Record<string, { tier: string; Low: number; Medium: number; High: number; Critical: number }> = {
      low: { tier: '< $25k', Low: 0, Medium: 0, High: 0, Critical: 0 },
      medium: { tier: '$25k - $50k', Low: 0, Medium: 0, High: 0, Critical: 0 },
      high: { tier: '$50k - $75k', Low: 0, Medium: 0, High: 0, Critical: 0 },
      critical: { tier: '$75k+', Low: 0, Medium: 0, High: 0, Critical: 0 },
    };

    records.forEach(r => {
      let tierKey = 'low';
      if (r.value >= 75000) tierKey = 'critical';
      else if (r.value >= 50000) tierKey = 'high';
      else if (r.value >= 25000) tierKey = 'medium';

      if (r.priority === 'low') tiers[tierKey].Low++;
      else if (r.priority === 'medium') tiers[tierKey].Medium++;
      else if (r.priority === 'high') tiers[tierKey].High++;
      else if (r.priority === 'critical') tiers[tierKey].Critical++;
    });

    return Object.values(tiers);
  }, [records]);

  const stackedKeys = [
    { key: 'Low', color: '#a09b8f', label: 'Low (<$25k)' },
    { key: 'Medium', color: '#b06000', label: 'Medium ($25k-$50k)' },
    { key: 'High', color: '#2563eb', label: 'High ($50k-$75k)' },
    { key: 'Critical', color: '#c5221f', label: 'Critical ($75k+)' },
  ];

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = (visibleRecords: SystemRecord[]) => {
    const allVisibleSelected = visibleRecords.length > 0 && visibleRecords.every(r => selectedIds.has(r.id));
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      visibleRecords.forEach(r => next.add(r.id));
      setSelectedIds(next);
    }
  };

  const columns = useMemo<ColumnDef<SystemRecord, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          const currentRows = table.getRowModel().rows.map(r => r.original);
          const isAllSelected = currentRows.length > 0 && currentRows.every(r => selectedIds.has(r.id));
          return (
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => toggleSelectAllVisible(currentRows)}
              title="Select all visible records"
              style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--accent)' }}
            />
          );
        },
        size: 45,
        cell: info => {
          const isSelected = selectedIds.has(info.row.original.id);
          return (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                toggleSelectRow(info.row.original.id);
              }}
              title="Select record"
              style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--accent)' }}
            />
          );
        },
      },
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
    [selectedIds, records]
  );

  const filterGroups = [
    {
      id: 'starred',
      label: 'Starred',
      options: [
        { label: 'Starred Only', value: 'true' },
        { label: 'Unstarred Only', value: 'false' },
      ],
    },
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

  const handleSaveEdit = (updatedRecord: SystemRecord) => {
    updateRecord(updatedRecord);
    toast({
      title: 'Record Updated',
      description: `${updatedRecord.id} saved successfully.`,
      type: 'success',
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    deleteRecord(deletingRecord.id);
    toast({
      title: 'Record Deleted',
      description: `${deletingRecord.id} was permanently removed.`,
      type: 'success',
    });
    setDeletingRecord(null);
  };

  const handleExecuteBulkDelete = () => {
    const ids = Array.from(selectedIds);
    deleteRecords(ids);
    toast({
      title: 'Batch Delete Successful',
      description: `Successfully deleted ${ids.length} selected items.`,
      type: 'success',
    });
    setSelectedIds(new Set());
    setIsBulkDeleteConfirmOpen(false);
  };

  const handleExecuteBulkEdit = (updates: { status?: Status; priority?: Priority }) => {
    const ids = Array.from(selectedIds);
    updateRecords(ids, updates);
    toast({
      title: 'Batch Edit Successful',
      description: `Updated ${ids.length} selected items.`,
      type: 'success',
    });
    setSelectedIds(new Set());
    setIsBulkEditOpen(false);
  };

  return (
    <PageShell
      title="Overview"
      description="Live operational summary & real-time analytics"
      breadcrumbs={[{ label: 'Home' }]}
    >
      <div className={styles.container}>
        {/* Metric Cards Grid - 100% Dynamic from DataContext */}
        <div className={styles.grid4}>
          <SummaryCard
            title="RECORDS MONITORED"
            value={records.length.toLocaleString()}
            subtitle="Central dataset live"
            icon={<Database size={18} />}
          />
          <SummaryCard
            title="ACTIVE NOW"
            value={activeCount.toLocaleString()}
            subtitle="Operational items"
            icon={<CheckCircle size={18} />}
          />
          <SummaryCard
            title="HIGH / CRITICAL ITEMS"
            value={highPriorityCount.toLocaleString()}
            subtitle="Priority review"
            icon={<AlertTriangle size={18} color="#c5221f" />}
          />
          <SummaryCard
            title="PORTFOLIO VALUE ($)"
            value={`$${(totalPortfolioValue / 1000000).toFixed(2)}M`}
            subtitle="Total financial evaluation"
            icon={<DollarSign size={18} color="#1e7e34" />}
          />
        </div>

        {/* 100% Dynamic Analytics Visualizations */}
        <CollapsibleSection
          title="Analytical Visualizations"
          subtitle="Priority distribution by category & top high-value entities"
          defaultOpen={true}
        >
          <div className={styles.grid2}>
            <ChartCard
              title="Priority Breakdown by Financial Tier"
              subtitle="Dynamic distribution across valuation tiers (<$25k to $75k+)"
              data={financialTierPriorityData}
              dataKey="High"
              categoryKey="tier"
              type="bar"
              stackedKeys={stackedKeys}
            />
            <TopFlaggedCard
              records={records}
            />
          </div>
        </CollapsibleSection>

        {/* Stream Table */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Master Record Stream</h2>
              <p className={styles.sectionSubtitle}>
                Live stream of {records.length.toLocaleString()} system records
              </p>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 16,
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckSquare size={18} color="var(--accent)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {selectedIds.size} record{selectedIds.size > 1 ? 's' : ''} selected
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsBulkEditOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 size={14} /> Bulk Edit ({selectedIds.size})
                </button>

                <button
                  type="button"
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #f7c5c2',
                    background: '#fce8e6',
                    color: '#c5221f',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} /> Delete Selected ({selectedIds.size})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          <ResourceTable<SystemRecord>
            data={records}
            columns={columns}
            searchFields={['name', 'id', 'owner']}
            searchPlaceholder="Search system records..."
            filterGroups={filterGroups}
            pageSize={10}
            resourceName="Record"
            exportable={false}
            getDetailTitle={item => item.id}
            renderDetail={selectedRecord => (
              <RecordDetailView
                record={selectedRecord}
                onToggleStar={toggleStarRecord}
                onEdit={rec => setEditingRecord(rec)}
                onDelete={rec => setDeletingRecord(rec)}
              />
            )}
          />
        </div>
      </div>

      {/* Edit Record Modal */}
      <EditRecordModal
        open={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        onSave={handleSaveEdit}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        open={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        selectedCount={selectedIds.size}
        onSave={handleExecuteBulkEdit}
      />

      {/* Confirm Delete Single Dialog */}
      <ConfirmDialog
        open={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Record"
        description={`Are you sure you want to delete ${deletingRecord?.id}? This action will permanently remove it from the system.`}
        confirmText="Delete Record"
        variant="danger"
      />

      {/* Confirm Bulk Delete Dialog */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onClose={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleExecuteBulkDelete}
        title="Confirm Batch Delete"
        description={`Are you sure you want to delete all ${selectedIds.size} selected records? This action cannot be undone.`}
        confirmText={`Delete ${selectedIds.size} Records`}
        variant="danger"
      />
    </PageShell>
  );
}
