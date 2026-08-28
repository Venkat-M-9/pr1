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
import { Database, Activity, CheckCircle, AlertTriangle, CheckSquare, Edit3, Trash2 } from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage() {
  const { records, toggleStarRecord, updateRecord, deleteRecord, deleteRecords, updateRecords, addRecord, importRecords } = useDataContext();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingRecord, setEditingRecord] = useState<SystemRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SystemRecord | null>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // 100% Dynamic Metrics calculated directly from DataContext system records
  const activeCount = useMemo(() => records.filter(r => r.status === 'active').length, [records]);
  const highPriorityCount = useMemo(() => records.filter(r => r.priority === 'critical' || r.priority === 'high').length, [records]);
  const avgRiskScore = useMemo(() => Math.round(records.reduce((acc, r) => acc + r.value, 0) / (records.length || 1)), [records]);

  // 100% Dynamic Priority Breakdown by Risk Score Tier for the Stacked Bar Chart
  const riskTierPriorityData = useMemo(() => {
    const tiers: Record<string, { tier: string; Low: number; Medium: number; High: number; Critical: number }> = {
      low: { tier: 'Low (< 25)', Low: 0, Medium: 0, High: 0, Critical: 0 },
      medium: { tier: 'Medium (25-49)', Low: 0, Medium: 0, High: 0, Critical: 0 },
      high: { tier: 'High (50-74)', Low: 0, Medium: 0, High: 0, Critical: 0 },
      critical: { tier: 'Critical (75+)', Low: 0, Medium: 0, High: 0, Critical: 0 },
    };

    records.forEach(r => {
      let tierKey = 'low';
      if (r.value >= 75) tierKey = 'critical';
      else if (r.value >= 50) tierKey = 'high';
      else if (r.value >= 25) tierKey = 'medium';

      if (r.priority === 'low') tiers[tierKey].Low++;
      else if (r.priority === 'medium') tiers[tierKey].Medium++;
      else if (r.priority === 'high') tiers[tierKey].High++;
      else if (r.priority === 'critical') tiers[tierKey].Critical++;
    });

    return Object.values(tiers);
  }, [records]);

  const stackedKeys = [
    { key: 'Low', color: '#2563eb', label: 'Low (< 25)' },
    { key: 'Medium', color: '#eab308', label: 'Medium (25-49)' },
    { key: 'High', color: '#ea580c', label: 'High (50-74)' },
    { key: 'Critical', color: '#dc3545', label: 'Critical (75+)' },
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
              title="Select all visible assets"
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
              title="Select asset"
              style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--accent)' }}
            />
          );
        },
      },
      { accessorKey: 'id', header: 'Asset ID', size: 100 },
      { accessorKey: 'name', header: 'Asset / Target Name', size: 220 },
      {
        accessorKey: 'status',
        header: 'Monitoring Status',
        cell: info => <StatusBadge value={info.getValue()} variant="status" />,
      },
      {
        accessorKey: 'priority',
        header: 'Threat Severity',
        cell: info => <StatusBadge value={info.getValue()} variant="priority" />,
      },
      { accessorKey: 'owner', header: 'SecOps Lead' },
      {
        accessorKey: 'value',
        header: 'Risk Score',
        cell: info => {
          const val = Number(info.getValue());
          const color = val >= 75 ? '#dc3545' : val >= 50 ? '#ea580c' : '#2563eb';
          return <span style={{ fontWeight: 700, color }}>{val} / 100</span>;
        },
      },
    ],
    [selectedIds, records]
  );

  const filterGroups = [
    {
      id: 'starred',
      label: 'Watchlist',
      options: [
        { label: 'Watchlist Only', value: 'true' },
        { label: 'Unflagged Only', value: 'false' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active Monitoring', value: 'active' },
        { label: 'Inactive / Offline', value: 'inactive' },
        { label: 'Remediation Pending', value: 'pending' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      id: 'priority',
      label: 'Threat Severity',
      options: [
        { label: 'Low (< 25)', value: 'low' },
        { label: 'Medium (25-49)', value: 'medium' },
        { label: 'High (50-74)', value: 'high' },
        { label: 'Critical (75+)', value: 'critical' },
      ],
    },
  ];

  const handleSaveEdit = (updatedRecord: SystemRecord) => {
    updateRecord(updatedRecord);
    toast.crud('update', 'Asset Updated', `${updatedRecord.id} (${updatedRecord.name}) saved successfully.`);
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    const deleted = deletingRecord;
    deleteRecord(deleted.id);
    toast.crud('delete', 'Asset Decommissioned', `${deleted.id} (${deleted.name}) was removed.`, {
      undo: () => {
        addRecord(deleted);
        toast.crud('create', 'Asset Restored', `${deleted.id} was successfully restored.`);
      },
    });
    setDeletingRecord(null);
  };

  const handleExecuteBulkDelete = () => {
    const ids = Array.from(selectedIds);
    const deletedList = records.filter(r => selectedIds.has(r.id));
    deleteRecords(ids);
    toast.crud('bulk_delete', 'Batch Decommission Complete', `Successfully removed ${ids.length} assets.`, {
      undo: () => {
        importRecords(deletedList);
        toast.crud('import', 'Batch Restore Complete', `Restored ${deletedList.length} assets.`);
      },
    });
    setSelectedIds(new Set());
    setIsBulkDeleteConfirmOpen(false);
  };

  const handleExecuteBulkEdit = (updates: { status?: Status; priority?: Priority }) => {
    const ids = Array.from(selectedIds);
    updateRecords(ids, updates);
    toast.crud('bulk_edit', 'Batch Status Updated', `Updated ${ids.length} selected assets.`);
    setSelectedIds(new Set());
    setIsBulkEditOpen(false);
  };

  const handleToggleStar = (id: string) => {
    const rec = records.find(r => r.id === id);
    const willStar = !rec?.starred;
    toggleStarRecord(id);
    toast.crud('star', willStar ? 'Added to Watchlist' : 'Removed from Watchlist', `${id} (${rec?.name || 'Asset'}) was ${willStar ? 'flagged for priority monitoring' : 'removed from watchlist'}.`);
  };

  return (
    <PageShell
      title="Security Operations Overview"
      description="SOC command center with live asset telemetry, threat risk breakdowns, and incident readiness metrics."
      breadcrumbs={[{ label: 'Home' }]}
    >
      <div className={styles.container}>
        {/* Metric Cards Grid - 100% Dynamic from DataContext */}
        <div className={styles.grid4}>
          <SummaryCard
            title="TOTAL MONITORED ASSETS"
            value={records.length.toLocaleString()}
            subtitle="Central telemetry live"
            icon={<Database size={18} />}
          />
          <SummaryCard
            title="ACTIVE MONITORED ENDPOINTS"
            value={activeCount.toLocaleString()}
            subtitle="Operational infrastructure"
            icon={<CheckCircle size={18} color="var(--success)" />}
          />
          <SummaryCard
            title="HIGH &amp; CRITICAL RISKS"
            value={highPriorityCount.toLocaleString()}
            subtitle="Immediate patching priority"
            icon={<AlertTriangle size={18} color="#dc3545" />}
          />
          <SummaryCard
            title="MEAN ASSET RISK SCORE"
            value={`${avgRiskScore} / 100`}
            subtitle="Composite exposure index"
            icon={<Activity size={18} color="#ea580c" />}
          />
        </div>

        {/* 100% Dynamic Analytics Visualizations */}
        <CollapsibleSection
          title="Analytical Threat Visualizations"
          subtitle="Severity distribution across risk scoring tiers and high-exposure infrastructure"
          defaultOpen={true}
        >
          <div className={styles.grid2}>
            <ChartCard
              title="Threat Severity by Risk Tier"
              subtitle="Dynamic distribution across risk tiers (Low <25 to Critical 75+)"
              data={riskTierPriorityData}
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
                onToggleStar={handleToggleStar}
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
