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
      { accessorKey: 'id', header: 'Log ID', size: 95 },
      { accessorKey: 'reference', header: 'CVE / Signature Ref', size: 140 },
      { accessorKey: 'title', header: 'Security Telemetry Alert', size: 240 },
      { accessorKey: 'type', header: 'Detection Type' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => <StatusBadge value={info.getValue()} variant="status" />,
      },
      { accessorKey: 'currency', header: 'Sensor' },
      { accessorKey: 'date', header: 'Detection Date' },
      {
        accessorKey: 'amount',
        header: 'Severity Score',
        cell: info => {
          const val = Number(info.getValue());
          const color = val >= 75 ? '#dc3545' : val >= 50 ? '#ea580c' : '#2563eb';
          return <span style={{ fontWeight: 700, color }}>{val} / 100</span>;
        },
      },
    ],
    []
  );

  const entryImportSchema: FieldSchema<Entry>[] = [
    { key: 'id', label: 'Log ID', defaultValue: `LOG-${Math.floor(Math.random() * 90000 + 10000)}` },
    { key: 'reference', label: 'CVE / Signature', defaultValue: `CVE-2024-${Math.floor(Math.random() * 8999 + 1000)}` },
    { key: 'title', label: 'Alert Title', defaultValue: 'New Sensor Telemetry Log' },
    { key: 'type', label: 'Detection Type', defaultValue: 'WAF Block' },
    { key: 'status', label: 'Status', defaultValue: 'active' },
    { key: 'currency', label: 'Sensor', defaultValue: 'SIEM' },
    { key: 'amount', label: 'Severity Score (0-100)', type: 'number', defaultValue: 70 },
    { key: 'date', label: 'Date', defaultValue: new Date().toISOString().split('T')[0] },
    { key: 'notes', label: 'Notes', defaultValue: 'Imported security sensor log.' },
  ];

  const filterGroups = [
    {
      id: 'type',
      label: 'Detection Type',
      options: [
        { label: 'WAF Block', value: 'WAF Block' },
        { label: 'EDR Detection', value: 'EDR Detection' },
        { label: 'Auth Anomaly', value: 'Auth Anomaly' },
        { label: 'Port Scan Drop', value: 'Port Scan Drop' },
        { label: 'DDoS Mitigation', value: 'DDoS Mitigation' },
        { label: 'Malware Quarantine', value: 'Malware Quarantine' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active Monitoring', value: 'active' },
        { label: 'Inactive / Closed', value: 'inactive' },
        { label: 'Investigating', value: 'pending' },
        { label: 'Resolved / Archived', value: 'archived' },
      ],
    },
  ];

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.crud('export', 'SOC Report Generated', `Security telemetry statement "${reportTitle || 'SOC Threat Brief'}" exported successfully.`);
    setReportTitle('');
  };

  return (
    <PageShell
      title="SOC Incident & Audit Telemetry Reports"
      description="Sensor cluster telemetry, firewall drop logs, MITRE technique references, and automated threat report exporter."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Audit Reports' }]}
    >
      <div>
        <ResourceTable<Entry>
          data={entries}
          columns={columns}
          searchFields={['title', 'reference', 'id', 'notes']}
          searchPlaceholder="Search CVE, log ID, or alert..."
          filterGroups={filterGroups}
          pageSize={15}
          resourceName="Telemetry Log"
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
