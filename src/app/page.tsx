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
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDataContext } from '@/context/DataContext';
import { Record as SystemRecord } from '@/lib/mockData';
import { toast } from '@/lib/toast';
import { ColumnDef } from '@tanstack/react-table';
import { Database, Activity, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage() {
  const { records, toggleStarRecord, updateRecord, deleteRecord } = useDataContext();

  const [editingRecord, setEditingRecord] = useState<SystemRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SystemRecord | null>(null);
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<SystemRecord | null>(null);

  const activeCount = useMemo(() => records.filter(r => r.status === 'active').length, [records]);
  const pendingCount = useMemo(() => records.filter(r => r.status === 'pending').length, [records]);

  // Stacked bar chart data matching Image 2 ("Alerts, last 7 days")
  const weeklyAlertsData = [
    { day: 'Mon', Low: 22, Medium: 18, High: 12 },
    { day: 'Tue', Low: 28, Medium: 25, High: 15 },
    { day: 'Wed', Low: 18, Medium: 14, High: 9 },
    { day: 'Thu', Low: 30, Medium: 22, High: 19 },
    { day: 'Fri', Low: 24, Medium: 16, High: 14 },
    { day: 'Sat', Low: 14, Medium: 10, High: 6 },
    { day: 'Today', Low: 26, Medium: 24, High: 22 },
  ];

  const stackedKeys = [
    { key: 'Low', color: '#d0ccc2', label: 'Low' },
    { key: 'Medium', color: '#b06000', label: 'Medium' },
    { key: 'High', color: '#c5221f', label: 'High' },
  ];

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

  return (
    <PageShell
      title="Overview"
      description="Org-wide · all groups · last 24 hours"
      breadcrumbs={[{ label: 'Home' }]}
    >
      <div className={styles.container}>
        {/* Metric Cards Grid matching Image 2 */}
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
            subtitle="Operational"
            icon={<CheckCircle size={18} />}
          />
          <SummaryCard
            title="OPEN ALERTS"
            value="4"
            subtitle="Action needed"
            icon={<AlertTriangle size={18} color="#c5221f" />}
          />
          <SummaryCard
            title="HIGH SEVERITY TODAY"
            value="2"
            subtitle="In portfolio"
            icon={<Activity size={18} color="#c5221f" />}
          />
        </div>

        {/* Visual Analytics Row: Stacked Bar Chart & Top Flagged Personnel matching Image 2 */}
        <CollapsibleSection
          title="Analytical Visualizations"
          subtitle="Alerts breakdown over last 7 days & top flagged entities"
          defaultOpen={true}
        >
          <div className={styles.grid2}>
            <ChartCard
              title="Alerts, last 7 days"
              subtitle="Daily threat and severity breakdown"
              data={weeklyAlertsData}
              dataKey="High"
              categoryKey="day"
              type="bar"
              stackedKeys={stackedKeys}
            />
            <TopFlaggedCard
              records={records}
              onSelectRecord={rec => setSelectedRecordForDrawer(rec)}
            />
          </div>
        </CollapsibleSection>

        {/* Activity Stream Table matching Image 1 & Image 2 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Recent alerts</h2>
              <p className={styles.sectionSubtitle}>
                Live stream of {records.length.toLocaleString()} system records
              </p>
            </div>
          </div>

          <ResourceTable<SystemRecord>
            data={records}
            columns={columns}
            searchFields={['name', 'id', 'owner']}
            searchPlaceholder="Search recent alerts..."
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
