'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import DataTable from '@/components/table/DataTable';
import FilterBar from '@/components/ui/FilterBar';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { generateEntries, Entry } from '@/lib/mockData';
import { useDebounce } from '@/lib/useDebounce';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Download, Plus, Check } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function ReportsPage() {
  const allEntries = useMemo(() => generateEntries(1500), []);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchRef = entry.reference.toLowerCase().includes(q);
        if (!matchTitle && !matchRef) return false;
      }
      if (selectedType && entry.type !== selectedType) return false;
      if (selectedStatus && entry.status !== selectedStatus) return false;
      return true;
    });
  }, [allEntries, debouncedSearch, selectedType, selectedStatus]);

  const columns = useMemo<ColumnDef<Entry, any>[]>(
    () => [
      { accessorKey: 'id', header: 'Entry ID', size: 90 },
      { accessorKey: 'reference', header: 'Reference', size: 120 },
      { accessorKey: 'title', header: 'Report Item Title', size: 180 },
      { accessorKey: 'type', header: 'Type' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => <StatusBadge value={info.getValue()} variant="status" />,
      },
      { accessorKey: 'date', header: 'Date' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: info => `${info.row.original.currency} $${info.getValue().toLocaleString()}`,
      },
    ],
    []
  );

  const filterGroups = [
    {
      id: 'type',
      label: 'Type',
      options: [
        { label: 'Invoice', value: 'invoice' },
        { label: 'Receipt', value: 'receipt' },
        { label: 'Credit', value: 'credit' },
        { label: 'Debit', value: 'debit' },
        { label: 'Transfer', value: 'transfer' },
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
  ];

  const handleExportCSV = () => {
    toast({
      title: 'CSV Export Initiated',
      description: `Downloading report containing ${filteredEntries.length} records.`,
      type: 'success',
    });
  };

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast({
      title: 'Report Generated',
      description: `Custom report "${reportTitle || 'Untitled Report'}" built successfully.`,
      type: 'success',
    });
    setReportTitle('');
  };

  return (
    <PageShell
      title="Financial & Audit Reports"
      description="Filterable statement reports with instant export and report builder."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsModalOpen(true)}
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
            <Plus size={14} /> New Report
          </button>

          <button
            onClick={handleExportCSV}
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
            <Download size={14} /> Export CSV
          </button>
        </div>
      }
    >
      <div>
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search reference or title..."
          filters={filterGroups}
          selectedFilters={{ type: selectedType, status: selectedStatus }}
          onFilterChange={(id, val) => {
            if (id === 'type') setSelectedType(val);
            if (id === 'status') setSelectedStatus(val);
          }}
          onResetFilters={() => {
            setSelectedType('');
            setSelectedStatus('');
          }}
        />

        {/* Challenge 2: Identical Paginated DataTable pattern */}
        <DataTable data={filteredEntries} columns={columns} pageSize={15} />

        {/* Modal for Report Builder */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Custom Financial Report"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '6px 14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'var(--text)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="report-form"
                style={{
                  padding: '6px 14px',
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Generate Report
              </button>
            </>
          }
        >
          <form id="report-form" onSubmit={handleGenerateCustom} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Report Title
              </label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                placeholder="e.g. Q3 Audit Statement"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Date Range
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last Quarter</option>
                <option value="365">Year to Date</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </PageShell>
  );
}
