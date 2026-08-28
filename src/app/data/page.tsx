'use client';

import { useMemo, useState, useCallback } from 'react';
import PageShell from '@/components/layout/PageShell';
import ResourceTable from '@/components/table/ResourceTable';
import StatusBadge from '@/components/ui/StatusBadge';
import RecordDetailView from '@/components/ui/RecordDetailView';
import EditRecordModal from '@/components/ui/EditRecordModal';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import BulkEditModal from '@/components/ui/BulkEditModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SummaryCard from '@/components/ui/SummaryCard';
import { useDataContext } from '@/context/DataContext';
import { Record as SystemRecord, Status, Priority } from '@/lib/mockData';
import { FieldSchema } from '@/lib/exportUtils';
import { toast } from '@/lib/toast';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, Edit3, Database, Activity, CheckSquare } from 'lucide-react';

export default function DataManagementPage() {
  const { records, importRecords, toggleStarRecord, updateRecord, deleteRecord, deleteRecords, updateRecords, addRecord } = useDataContext();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SystemRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SystemRecord | null>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [filteredRecords, setFilteredRecords] = useState<SystemRecord[]>(records);

  const handleFilteredDataChange = useCallback((newFiltered: SystemRecord[]) => {
    setFilteredRecords(newFiltered);
  }, []);

  // Synchronize filtered records with master records state on updates/deletions
  const activeFilteredRecords = useMemo(() => {
    const recordMap = new Map(records.map(r => [r.id, r]));
    const list = filteredRecords.map(r => recordMap.get(r.id)).filter((r): r is SystemRecord => Boolean(r));
    return list.length > 0 ? list : records;
  }, [records, filteredRecords]);

  // Live Aggregate Security Metrics calculated dynamically from active filtered dataset slice
  const criticalCount = useMemo(
    () => activeFilteredRecords.filter(r => r.priority === 'critical' || r.value >= 75).length,
    [activeFilteredRecords]
  );
  const avgRiskScore = useMemo(
    () => (activeFilteredRecords.length > 0 ? activeFilteredRecords.reduce((acc, r) => acc + r.value, 0) / activeFilteredRecords.length : 0),
    [activeFilteredRecords]
  );

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
      { accessorKey: 'id', header: 'Asset ID', size: 110 },
      { accessorKey: 'name', header: 'Asset / Target Name', size: 240 },
      {
        accessorKey: 'status',
        header: 'Monitoring Status',
        cell: info => <StatusBadge value={info.getValue()} variant="status" />,
      },
      {
        accessorKey: 'priority',
        header: 'Severity',
        cell: info => <StatusBadge value={info.getValue()} variant="priority" />,
      },
      { accessorKey: 'owner', header: 'SecOps Owner' },
      { accessorKey: 'createdAt', header: 'Discovered Date' },
      {
        accessorKey: 'value',
        header: 'Risk Score',
        cell: info => {
          const val = Number(info.getValue());
          const color = val >= 75 ? '#dc3545' : val >= 50 ? '#ea580c' : '#2563eb';
          return (
            <span style={{ fontWeight: 700, color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {val} / 100
            </span>
          );
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
        { label: 'Unflagged', value: 'false' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active Monitoring', value: 'active' },
        { label: 'Inactive / Offline', value: 'inactive' },
        { label: 'Remediation Pending', value: 'pending' },
        { label: 'Archived / Remediated', value: 'archived' },
      ],
    },
    {
      id: 'priority',
      label: 'Threat Severity',
      options: [
        { label: 'Low Severity (Score < 25)', value: 'low' },
        { label: 'Medium Severity (Score 25-50)', value: 'medium' },
        { label: 'High Severity (Score 50-75)', value: 'high' },
        { label: 'Critical Severity (Score 75+)', value: 'critical' },
      ],
    },
  ];

  const recordImportSchema: FieldSchema<SystemRecord>[] = [
    { key: 'id', label: 'Asset ID', defaultValue: `AST-${Math.floor(Math.random() * 90000 + 10000)}` },
    { key: 'name', label: 'Asset / Target Name', defaultValue: 'New Monitored Infrastructure' },
    { key: 'status', label: 'Status', defaultValue: 'active' },
    { key: 'priority', label: 'Severity', defaultValue: 'medium' },
    { key: 'owner', label: 'SecOps Owner', defaultValue: 'Sarah Connor (SOC Lead)' },
    { key: 'value', label: 'Risk Score (0-100)', type: 'number', defaultValue: 65 },
    { key: 'createdAt', label: 'Discovered Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'updatedAt', label: 'Last Scanned', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'description', label: 'Description', defaultValue: 'Imported security asset telemetry.' },
  ];

  const handleCreateRecord = (newRecord: SystemRecord) => {
    addRecord(newRecord);
    toast.crud('create', 'Asset Registered', `${newRecord.id} (${newRecord.name}) added to SOC registry.`, {
      recordId: newRecord.id,
      recordName: newRecord.name,
      undo: () => deleteRecord(newRecord.id),
    });
  };

  const handleSaveEdit = (updatedRecord: SystemRecord) => {
    updateRecord(updatedRecord);
    toast.crud('update', 'Asset Updated', `${updatedRecord.id} (${updatedRecord.name}) saved with severity ${updatedRecord.priority.toUpperCase()}.`, {
      recordId: updatedRecord.id,
      recordName: updatedRecord.name,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    const deleted = deletingRecord;
    deleteRecord(deleted.id);
    toast.crud('delete', 'Asset Decommissioned', `${deleted.id} (${deleted.name}) removed from monitoring.`, {
      recordId: deleted.id,
      recordName: deleted.name,
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
    toast.crud('bulk_delete', 'Batch Decommission Complete', `Successfully removed ${ids.length} assets from monitoring.`, {
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
    toast.crud('bulk_edit', 'Batch Status Updated', `Successfully updated ${ids.length} selected assets.`);
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
      title="Security Asset & Threat Telemetry Management"
      description="SOC crown-jewel asset inventory, threat exposure indexes, vulnerability tracking, and batch mitigation controls."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Asset Management' }]}
    >
      {/* Security Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <SummaryCard
          title="CRITICAL RISK ASSETS"
          value={`${criticalCount} Crown Jewels`}
          subtitle="Assets with Risk Score >= 75 requiring patching"
          icon={<Activity size={18} color="#dc3545" />}
        />
        <SummaryCard
          title="MONITORED ASSETS"
          value={activeFilteredRecords.length.toLocaleString()}
          subtitle="Active infrastructure endpoints under SIEM"
          icon={<Database size={18} />}
        />
        <SummaryCard
          title="MEAN ASSET RISK SCORE"
          value={`${Math.round(avgRiskScore)} / 100`}
          subtitle="Composite threat exposure index"
          icon={<Activity size={18} color="#ea580c" />}
        />
      </div>

      {/* Prominent Multi-Select Bulk Action Bar */}
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

      {/* Main Resource Table */}
      <ResourceTable<SystemRecord>
        data={records}
        columns={columns}
        searchFields={['name', 'id', 'owner', 'description']}
        searchPlaceholder="Search by ID, Title, Owner..."
        filterGroups={filterGroups}
        virtualize={true}
        resourceName="Record"
        onAddClick={() => setIsCreateOpen(true)}
        addLabel="New Record"
        exportable={true}
        importable={true}
        importSchema={recordImportSchema}
        onImport={importRecords}
        onFilteredDataChange={handleFilteredDataChange}
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

      {/* Create Record Modal */}
      <CreateRecordModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRecord}
      />

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

      {/* Confirm Delete Single Record Dialog */}
      <ConfirmDialog
        open={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Record"
        description={`Are you sure you want to delete ${deletingRecord?.id}? This action will remove it from the system.`}
        confirmText="Delete Record"
        variant="danger"
      />

      {/* Confirm Bulk Delete Dialog */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onClose={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleExecuteBulkDelete}
        title="Confirm Batch Delete"
        description={`Are you sure you want to delete all ${selectedIds.size} selected records?`}
        confirmText={`Delete ${selectedIds.size} Records`}
        variant="danger"
      />
    </PageShell>
  );
}
