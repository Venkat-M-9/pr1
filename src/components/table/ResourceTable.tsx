'use client';

import { ReactNode, useState } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import DataTable from '@/components/table/DataTable';
import FilterBar from '@/components/ui/FilterBar';
import Drawer from '@/components/ui/Drawer';
import ImportModal from '@/components/ui/ImportModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTableManager, FilterGroup } from '@/hooks/useTableManager';
import { usePreferences } from '@/context/PreferencesContext';
import { exportToCSV, FieldSchema } from '@/lib/exportUtils';
import { toast } from '@/lib/toast';
import { Download, Upload } from 'lucide-react';

export interface ResourceTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchFields?: (keyof TData)[];
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  pageSize?: number;
  virtualize?: boolean;
  resourceName?: string;
  exportable?: boolean;
  importable?: boolean;
  importSchema?: FieldSchema<TData>[];
  onImport?: (newItems: TData[]) => void;
  renderDetail?: (item: TData) => ReactNode;
  getDetailTitle?: (item: TData) => string;
  actions?: ReactNode;
  initialSorting?: SortingState;
}

export default function ResourceTable<TData extends Record<string, any>>({
  data,
  columns,
  searchFields = [],
  searchPlaceholder = 'Search records...',
  filterGroups = [],
  pageSize: propPageSize,
  virtualize = false,
  resourceName = 'Resource',
  exportable = true,
  importable = false,
  importSchema,
  onImport,
  renderDetail,
  getDetailTitle,
  actions,
  initialSorting = [{ id: 'id', desc: false }],
}: ResourceTableProps<TData>) {
  // Challenge 9: Consume default page size preference if prop is not explicitly passed
  const { pageSize: prefPageSize } = usePreferences();
  const effectivePageSize = propPageSize ?? prefPageSize;

  // Use centralized hook for 100% reusable table state and filtering logic
  const {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setFilter,
    resetFilters,
    sorting,
    setSorting,
    selectedRecord,
    setSelectedRecord,
    clearSelectedRecord,
    filteredData,
    filteredCount,
  } = useTableManager<TData>({
    data,
    searchFields,
    initialSorting,
  });

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = () => {
    // Challenge 10: Guard against exporting 0 records
    if (filteredCount === 0) {
      toast({
        title: 'Export Unsuccessful',
        description: 'No matching records available to export.',
        type: 'warning',
      });
      return;
    }

    // Prompt confirm if exporting large dataset (>1,000 items)
    if (filteredCount > 1000) {
      setIsExportConfirmOpen(true);
    } else {
      executeExport();
    }
  };

  const executeExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportToCSV(
        filteredData,
        `${resourceName.toLowerCase()}_export_${Date.now()}.csv`,
        columns.map(c => {
          const key = (c as any).accessorKey || (c as any).id;
          const label = typeof c.header === 'string' ? c.header : String(key);
          return { key, label };
        })
      );
      toast({
        title: 'Export Complete',
        description: `Exported ${filteredCount.toLocaleString()} ${resourceName.toLowerCase()}(s) to CSV file.`,
        type: 'success',
      });
      setIsExporting(false);
    }, 150);
  };

  return (
    <div>
      {/* Standardized Filter & Action Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        filters={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={setFilter}
        onResetFilters={resetFilters}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {importable && importSchema && onImport && (
              <button
                type="button"
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
                <Upload size={14} /> Import {resourceName}s
              </button>
            )}

            {exportable && (
              <button
                type="button"
                onClick={handleExportClick}
                disabled={isExporting}
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
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  opacity: isExporting ? 0.7 : 1,
                }}
              >
                <Download size={14} /> {isExporting ? 'Exporting...' : `Export CSV (${filteredCount.toLocaleString()})`}
              </button>
            )}

            {actions}
          </div>
        }
      />

      {/* Core Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        sorting={sorting}
        onSortingChange={setSorting}
        virtualize={virtualize}
        pageSize={effectivePageSize}
        onRowClick={renderDetail ? item => setSelectedRecord(item) : undefined}
      />

      {/* Standardized Import Modal */}
      {importable && importSchema && onImport && (
        <ImportModal<TData>
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={onImport}
          schema={importSchema}
          entityName={resourceName}
          sampleData={data.slice(0, 3)}
        />
      )}

      {/* Confirm Export Modal for Challenge 10 */}
      <ConfirmDialog
        open={isExportConfirmOpen}
        onClose={() => setIsExportConfirmOpen(false)}
        onConfirm={executeExport}
        title="Confirm Data Export"
        description={`You are about to export ${filteredCount.toLocaleString()} ${resourceName.toLowerCase()} records to a CSV file. Do you want to proceed?`}
        confirmText="Download CSV"
      />

      {/* Standardized Side Detail Drawer */}
      {renderDetail && (
        <Drawer
          open={!!selectedRecord}
          onClose={clearSelectedRecord}
          title={
            selectedRecord
              ? getDetailTitle
                ? getDetailTitle(selectedRecord)
                : selectedRecord.id || `${resourceName} Details`
              : `${resourceName} Details`
          }
        >
          {selectedRecord && renderDetail(selectedRecord)}
        </Drawer>
      )}
    </div>
  );
}
