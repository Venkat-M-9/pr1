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
import { Trash2, Edit3, DollarSign, Database, Activity, CheckSquare } from 'lucide-react';

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

  // Live Aggregate Financial Metrics calculated dynamically from active filtered dataset slice
  const totalValue = useMemo(
    () => activeFilteredRecords.reduce((acc, r) => acc + r.value, 0),
    [activeFilteredRecords]
  );
  const avgValue = useMemo(
    () => (activeFilteredRecords.length > 0 ? totalValue / activeFilteredRecords.length : 0),
    [activeFilteredRecords, totalValue]
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
      { accessorKey: 'id', header: 'Record ID', size: 100 },
      { accessorKey: 'name', header: 'Title / Name', size: 180 },
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
      { accessorKey: 'createdAt', header: 'Created Date' },
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
        { label: 'Low (<$25k)', value: 'low' },
        { label: 'Medium ($25k-$50k)', value: 'medium' },
        { label: 'High ($50k-$75k)', value: 'high' },
        { label: 'Critical ($75k+)', value: 'critical' },
      ],
    },
  ];

  const recordImportSchema: FieldSchema<SystemRecord>[] = [
    { key: 'id', label: 'Record ID', defaultValue: `REC-${Math.floor(Math.random() * 90000 + 10000)}` },
    { key: 'name', label: 'Title / Name', defaultValue: 'New Imported Record' },
    { key: 'status', label: 'Status', defaultValue: 'active' },
    { key: 'priority', label: 'Priority', defaultValue: 'medium' },
    { key: 'owner', label: 'Owner', defaultValue: 'System Admin' },
    { key: 'value', label: 'Value ($)', type: 'number', defaultValue: 50000 },
    { key: 'createdAt', label: 'Created Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'updatedAt', label: 'Updated Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'description', label: 'Description', defaultValue: 'Imported via data manager.' },
  ];

  const handleCreateRecord = (newRecord: SystemRecord) => {
    addRecord(newRecord);
    toast.crud('create', 'Record Created', `${newRecord.id} (${newRecord.name}) added to dataset.`, {
      recordId: newRecord.id,
      recordName: newRecord.name,
      undo: () => deleteRecord(newRecord.id),
    });
  };

  const handleSaveEdit = (updatedRecord: SystemRecord) => {
    updateRecord(updatedRecord);
    toast.crud('update', 'Record Updated', `${updatedRecord.id} (${updatedRecord.name}) saved with priority ${updatedRecord.priority.toUpperCase()}.`, {
      recordId: updatedRecord.id,
      recordName: updatedRecord.name,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    const deleted = deletingRecord;
    deleteRecord(deleted.id);
    toast.crud('delete', 'Record Deleted', `${deleted.id} (${deleted.name}) permanently removed.`, {
      recordId: deleted.id,
      recordName: deleted.name,
      undo: () => {
        addRecord(deleted);
        toast.crud('create', 'Record Restored', `${deleted.id} was successfully restored.`);
      },
    });
    setDeletingRecord(null);
  };

  const handleExecuteBulkDelete = () => {
    const ids = Array.from(selectedIds);
    const deletedList = records.filter(r => selectedIds.has(r.id));
    deleteRecords(ids);
    toast.crud('bulk_delete', 'Batch Delete Complete', `Successfully removed ${ids.length} records from the workspace.`, {
      undo: () => {
        importRecords(deletedList);
        toast.crud('import', 'Batch Restore Complete', `Restored ${deletedList.length} records.`);
      },
    });
    setSelectedIds(new Set());
    setIsBulkDeleteConfirmOpen(false);
  };

  const handleExecuteBulkEdit = (updates: { status?: Status; priority?: Priority }) => {
    const ids = Array.from(selectedIds);
    updateRecords(ids, updates);
    toast.crud('bulk_edit', 'Batch Edit Complete', `Successfully updated ${ids.length} selected records.`);
    setSelectedIds(new Set());
    setIsBulkEditOpen(false);
  };

  const handleToggleStar = (id: string) => {
    const rec = records.find(r => r.id === id);
    const willStar = !rec?.starred;
    toggleStarRecord(id);
    toast.crud('star', willStar ? 'Record Starred' : 'Removed from Starred', `${id} (${rec?.name || 'Record'}) was ${willStar ? 'added to favorites' : 'unfavorited'}.`);
  };

  return (
    <PageShell
      title="Data Management"
      description="Financial & master record repository with multi-select batch controls, virtualization, and export capabilities."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Data Management' }]}
    >
      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <SummaryCard
          title="TOTAL DATASET VALUE"
          value={`$${(totalValue / 1000000).toFixed(2)}M`}
          subtitle="Real-time aggregate value of filtered slice"
          icon={<DollarSign size={18} color="#1e7e34" />}
        />
        <SummaryCard
          title="MANAGED RECORDS"
          value={activeFilteredRecords.length.toLocaleString()}
          subtitle="Currently filtered active items"
          icon={<Database size={18} />}
        />
        <SummaryCard
          title="AVERAGE RECORD VALUE"
          value={`$${Math.round(avgValue).toLocaleString()}`}
          subtitle="Mean financial evaluation per item"
          icon={<Activity size={18} />}
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
