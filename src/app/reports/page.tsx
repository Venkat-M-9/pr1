'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import ResourceTable from '@/components/table/ResourceTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { useDataContext } from '@/context/DataContext';
import { Entry } from '@/lib/mockData';
import { FieldSchema } from '@/lib/exportUtils';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function ReportsPage() {
  const { entries, importEntries } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

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

  const entryImportSchema: FieldSchema<Entry>[] = [
    { key: 'id', label: 'Entry ID', defaultValue: `ENT-${Math.floor(Math.random() * 90000 + 10000)}` },
    { key: 'reference', label: 'Reference', defaultValue: `REF-${Math.floor(Math.random() * 900000 + 100000)}` },
    { key: 'title', label: 'Title', defaultValue: 'New Financial Entry' },
    { key: 'type', label: 'Type', defaultValue: 'invoice' },
    { key: 'status', label: 'Status', defaultValue: 'active' },
    { key: 'currency', label: 'Currency', defaultValue: 'USD' },
    { key: 'amount', label: 'Amount', type: 'number', defaultValue: 500 },
    { key: 'date', label: 'Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'notes', label: 'Notes', defaultValue: 'Imported via report manager.' },
  ];

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

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.crud('export', 'Report Generated', `Custom statement report "${reportTitle || 'Untitled Report'}" built successfully.`);
    setReportTitle('');
  };

  return (
    <PageShell
      title="Financial & Audit Reports"
      description="Filterable statement reports with instant export and report builder."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
    >
      <div>
        <ResourceTable<Entry>
          data={entries}
          columns={columns}
          searchFields={['title', 'reference', 'id', 'notes']}
          searchPlaceholder="Search reference or title..."
          filterGroups={filterGroups}
          pageSize={15}
          resourceName="Financial Entry"
          exportable={true}
          importable={true}
          importSchema={entryImportSchema}
          onImport={importEntries}
          getDetailTitle={entry => `${entry.reference} — ${entry.title}`}
          actions={
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
          }
          renderDetail={selectedEntry => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Title & Reference</span>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{selectedEntry.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedEntry.reference}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge value={selectedEntry.status} variant="status" />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type</span>
                  <p style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize', marginTop: 4 }}>
                    {selectedEntry.type}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date</span>
                  <p style={{ fontSize: 13, marginTop: 2 }}>{selectedEntry.date}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount</span>
                  <p style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
                    {selectedEntry.currency} ${selectedEntry.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Notes</span>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
                  {selectedEntry.notes}
                </p>
              </div>
            </div>
          )}
        />

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
