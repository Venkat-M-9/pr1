'use client';

import { useMemo } from 'react';
import PageShell from '@/components/layout/PageShell';
import ResourceTable from '@/components/table/ResourceTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useDataContext } from '@/context/DataContext';
import { Record as SystemRecord } from '@/lib/mockData';
import { FieldSchema } from '@/lib/exportUtils';
import { ColumnDef } from '@tanstack/react-table';

export default function DataManagementPage() {
  const { records, importRecords } = useDataContext();

  const columns = useMemo<ColumnDef<SystemRecord, any>[]>(
    () => [
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

  return (
    <PageShell
      title="Data Management"
      description="Performantly query, filter, import, and inspect 5,000+ virtualized system records."
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
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tags</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {selectedRecord.tags.map(t => (
                  <StatusBadge key={t} value={t} variant="tag" />
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Description</span>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
                {selectedRecord.description}
              </p>
            </div>
          </div>
        )}
      />
    </PageShell>
  );
}
