'use client';

import { useMemo, useState, ReactNode } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import DataTable from '@/components/table/DataTable';
import FilterBar from '@/components/ui/FilterBar';
import Drawer from '@/components/ui/Drawer';
import ImportModal from '@/components/ui/ImportModal';
import { useDebounce } from '@/lib/useDebounce';
import { exportToCSV, FieldSchema } from '@/lib/exportUtils';
import { toast } from '@/lib/toast';
import { Download, Upload } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchableKeys?: (keyof TData)[];
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  pageSize?: number;
  virtualize?: boolean;
  entityName?: string;
  exportable?: boolean;
  importable?: boolean;
  importSchema?: FieldSchema<TData>[];
  onImport?: (newItems: TData[]) => void;
  renderDetail?: (item: TData) => ReactNode;
  getDetailTitle?: (item: TData) => string;
  actions?: ReactNode;
  initialSorting?: SortingState;
}

export default function DataGrid<TData extends Record<string, any>>({
  data,
  columns,
  searchableKeys = [],
  searchPlaceholder = 'Search records...',
  filterGroups = [],
  pageSize = 20,
  virtualize = false,
  entityName = 'Record',
  exportable = true,
  importable = false,
  importSchema,
  onImport,
  renderDetail,
  getDetailTitle,
  actions,
  initialSorting = [{ id: 'id', desc: false }],
}: DataGridProps<TData>) {
  // Built-in reactive state (no manual 50-line wiring on every page!)
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [selectedItem, setSelectedItem] = useState<TData | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Generic, robust filter logic supporting any data structure
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search matching across all designated searchableKeys
      if (debouncedSearch && searchableKeys.length > 0) {
        const q = debouncedSearch.toLowerCase();
        const matchesSearch = searchableKeys.some(key => {
          const val = item[key];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(q);
        });
        if (!matchesSearch) return false;
      }

      // Filter matching across all active filterGroups
      for (const [filterId, filterValue] of Object.entries(selectedFilters)) {
        if (filterValue && String(item[filterId]) !== String(filterValue)) {
          return false;
        }
      }

      return true;
    });
  }, [data, debouncedSearch, searchableKeys, selectedFilters]);

  const handleExport = () => {
    exportToCSV(
      filteredData,
      `${entityName.toLowerCase()}s_export_${Date.now()}.csv`,
      columns.map(c => {
        const key = (c as any).accessorKey || (c as any).id;
        const label = typeof c.header === 'string' ? c.header : String(key);
        return { key, label };
      })
    );
    toast({
      title: 'Export Complete',
      description: `Downloaded ${filteredData.length.toLocaleString()} ${entityName.toLowerCase()}(s) to CSV file.`,
      type: 'success',
    });
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
  };

  return (
    <div>
      {/* Toolbar combining search, filter dropdowns, import, export & custom action slots */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        filters={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={(id, val) => setSelectedFilters(prev => ({ ...prev, [id]: val }))}
        onResetFilters={handleResetFilters}
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
                <Upload size={14} /> Import {entityName}s
              </button>
            )}

            {exportable && (
              <button
                type="button"
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
                <Download size={14} /> Export CSV ({filteredData.length.toLocaleString()})
              </button>
            )}

            {actions}
          </div>
        }
      />

      {/* Core Table rendering with automatic sorting state management */}
      <DataTable
        data={filteredData}
        columns={columns}
        sorting={sorting}
        onSortingChange={setSorting}
        virtualize={virtualize}
        pageSize={pageSize}
        onRowClick={renderDetail ? item => setSelectedItem(item) : undefined}
      />

      {/* Built-in Generic Import Modal */}
      {importable && importSchema && onImport && (
        <ImportModal<TData>
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={onImport}
          schema={importSchema}
          entityName={entityName}
          sampleData={data.slice(0, 3)}
        />
      )}

      {/* Built-in Generic Detail Drawer */}
      {renderDetail && (
        <Drawer
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={
            selectedItem
              ? getDetailTitle
                ? getDetailTitle(selectedItem)
                : selectedItem.id || `${entityName} Details`
              : `${entityName} Details`
          }
        >
          {selectedItem && renderDetail(selectedItem)}
        </Drawer>
      )}
    </div>
  );
}
