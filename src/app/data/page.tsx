'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import DataTable from '@/components/table/DataTable';
import FilterBar from '@/components/ui/FilterBar';
import Drawer from '@/components/ui/Drawer';
import StatusBadge from '@/components/ui/StatusBadge';
import ImportModal from '@/components/ui/ImportModal';
import { useDataContext } from '@/context/DataContext';
import { Record as SystemRecord } from '@/lib/mockData';
import { exportToCSV, FieldSchema } from '@/lib/exportUtils';
import { useDebounce } from '@/lib/useDebounce';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { Download, Upload, Plus } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function DataManagementPage() {
  // Access central reactive dataset and import function from DataContext
  const { records: allRecords, importRecords } = useDataContext();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: '',
    priority: '',
    category: '',
  });

  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [selectedRecord, setSelectedRecord] = useState<SystemRecord | null>(null);

  // Challenge 1: Performantly filter records in memory
  const filteredRecords = useMemo(() => {
    return allRecords.filter(item => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchOwner = item.owner.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchOwner) return false;
      }

      if (selectedFilters.status && item.status !== selectedFilters.status) return false;
      if (selectedFilters.priority && item.priority !== selectedFilters.priority) return false;
      if (selectedFilters.category && item.category !== selectedFilters.category) return false;

      return true;
    });
  }, [allRecords, debouncedSearch, selectedFilters]);

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

  const handleExport = () => {
    exportToCSV(filteredRecords, `records_export_${Date.now()}.csv`, [
      { key: 'id', label: 'Record ID' },
      { key: 'name', label: 'Title / Name' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'category', label: 'Category' },
      { key: 'owner', label: 'Owner' },
      { key: 'value', label: 'Value ($)' },
      { key: 'createdAt', label: 'Created Date' },
    ]);
    toast({
      title: 'Export Complete',
      description: `Downloaded ${filteredRecords.length.toLocaleString()} records to CSV file.`,
      type: 'success',
    });
  };

  const handleImportRecords = (newRecords: SystemRecord[]) => {
    importRecords(newRecords);
  };

  return (
    <PageShell
      title="Data Management"
      description="Performantly query, filter, import, and inspect 5,000+ virtualized system records."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Data Management' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsImportOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <Upload size={14} /> Import Data
          </button>

          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Export CSV ({filteredRecords.length.toLocaleString()})
          </button>
        </div>
      }
    >
      <div>
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by ID, Title, or Owner..."
          filters={filterGroups}
          selectedFilters={selectedFilters}
          onFilterChange={(id, val) => setSelectedFilters(prev => ({ ...prev, [id]: val }))}
          onResetFilters={() => setSelectedFilters({ status: '', priority: '', category: '' })}
        />

        {/* Challenge 1: Virtualized Table for smooth rendering of 5,000+ records */}
        <DataTable
          data={filteredRecords}
          columns={columns}
          sorting={sorting}
          onSortingChange={setSorting}
          virtualize={true}
          onRowClick={record => setSelectedRecord(record)}
        />

        {/* Generic Reusable Import Modal */}
        <ImportModal<SystemRecord>
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImportRecords}
          schema={recordImportSchema}
          entityName="Record"
          sampleData={allRecords.slice(0, 3)}
        />

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
        </Drawer>
      </div>
    </PageShell>
  );
}
