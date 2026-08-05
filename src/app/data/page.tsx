'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import ResourceTable from '@/components/table/ResourceTable';
import StatusBadge from '@/components/ui/StatusBadge';
import RecordDetailView from '@/components/ui/RecordDetailView';
import EditRecordModal from '@/components/ui/EditRecordModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDataContext } from '@/context/DataContext';
import { Record as SystemRecord } from '@/lib/mockData';
import { FieldSchema } from '@/lib/exportUtils';
import { toast } from '@/lib/toast';
import { ColumnDef } from '@tanstack/react-table';
import { Star } from 'lucide-react';

export default function DataManagementPage() {
  const { records, importRecords, toggleStarRecord, updateRecord, deleteRecord } = useDataContext();

  const [editingRecord, setEditingRecord] = useState<SystemRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SystemRecord | null>(null);

  const columns = useMemo<ColumnDef<SystemRecord, any>[]>(
    () => [
      {
        id: 'starred',
        header: '★',
        size: 45,
        cell: info => {
          const isStarred = Boolean(info.row.original.starred);
          return (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                toggleStarRecord(info.row.original.id);
                toast({
                  title: isStarred ? 'Unstarred Record' : 'Starred Record',
                  description: `${info.row.original.id} was ${isStarred ? 'removed from' : 'added to'} starred list.`,
                  type: 'info',
                });
              }}
              title={isStarred ? 'Unstar record' : 'Star record'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isStarred ? '#f59e0b' : 'var(--text-muted)',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={16} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
            </button>
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
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'owner', header: 'Owner' },
      { accessorKey: 'createdAt', header: 'Created Date' },
      {
        accessorKey: 'value',
        header: 'Value ($)',
        cell: info => `$${info.getValue().toLocaleString()}`,
      },
    ],
    [toggleStarRecord]
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
    {
      id: 'category',
      label: 'Category',
      options: [
        { label: 'Alpha', value: 'alpha' },
        { label: 'Beta', value: 'beta' },
        { label: 'Gamma', value: 'gamma' },
        { label: 'Delta', value: 'delta' },
        { label: 'Epsilon', value: 'epsilon' },
      ],
    },
  ];

  const recordImportSchema: FieldSchema<SystemRecord>[] = [
    { key: 'id', label: 'Record ID', defaultValue: `REC-${Math.floor(Math.random() * 90000 + 10000)}` },
    { key: 'name', label: 'Title / Name', defaultValue: 'New Imported Record' },
    { key: 'status', label: 'Status', defaultValue: 'active' },
    { key: 'priority', label: 'Priority', defaultValue: 'medium' },
    { key: 'category', label: 'Category', defaultValue: 'alpha' },
    { key: 'owner', label: 'Owner', defaultValue: 'System Admin' },
    { key: 'value', label: 'Value ($)', type: 'number', defaultValue: 1000 },
    { key: 'createdAt', label: 'Created Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'updatedAt', label: 'Updated Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'description', label: 'Description', defaultValue: 'Imported via data manager.' },
  ];

  const handleSaveEdit = (updatedRecord: SystemRecord) => {
    updateRecord(updatedRecord);
    toast({
      title: 'Record Updated',
      description: `${updatedRecord.id} updated successfully.`,
      type: 'success',
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    deleteRecord(deletingRecord.id);
    toast({
      title: 'Record Deleted',
      description: `${deletingRecord.id} deleted.`,
      type: 'success',
    });
    setDeletingRecord(null);
  };

  return (
    <PageShell
      title="Data Management"
      description="Performantly query, filter, import, edit, star, and inspect 5,000+ virtualized system records."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Data Management' }]}
    >
      <ResourceTable<SystemRecord>
        data={records}
        columns={columns}
        searchFields={['name', 'id', 'owner', 'description']}
        searchPlaceholder="Search by ID, Title, Owner..."
        filterGroups={filterGroups}
        virtualize={true}
        resourceName="Record"
        exportable={true}
        importable={true}
        importSchema={recordImportSchema}
        onImport={importRecords}
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

      {/* Edit Record Modal */}
      <EditRecordModal
        open={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        onSave={handleSaveEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Record"
        description={`Are you sure you want to delete ${deletingRecord?.id}? This action will permanently remove it from the system.`}
        confirmText="Delete Record"
        variant="danger"
      />
    </PageShell>
  );
}
