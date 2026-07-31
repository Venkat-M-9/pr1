'use client';

import { useRef, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import styles from './DataTable.module.css';

interface Props<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  virtualize?: boolean;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
}

export default function DataTable<TData>({
  data,
  columns,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  virtualize = false,
  onRowClick,
  pageSize = 20,
}: Props<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const sorting = externalSorting !== undefined ? externalSorting : internalSorting;
  const onSortingChange = externalOnSortingChange || setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: updater => {
      const next = typeof updater === 'function' ? updater(sorting || []) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: !virtualize ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const [pageInput, setPageInput] = useState(String(table.getState().pagination.pageIndex + 1));

  useEffect(() => {
    setPageInput(String(table.getState().pagination.pageIndex + 1));
  }, [table.getState().pagination.pageIndex]);

  const handleJumpToPage = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum)) {
      const targetPage = Math.max(1, Math.min(pageNum, table.getPageCount()));
      table.setPageIndex(targetPage - 1);
      setPageInput(String(targetPage));
    } else {
      setPageInput(String(table.getState().pagination.pageIndex + 1));
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
    enabled: virtualize,
  });

  if (data.length === 0) {
    return <EmptyState title="No records found" description="Try adjusting your search query or active filters." />;
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.scrollWrapper} ref={parentRef}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={canSort ? styles.sortableHeader : ''}
                    >
                      <div className={styles.headerCell}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className={styles.sortIcon}>
                            {isSorted === 'asc' ? (
                              <ArrowUp size={12} />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown size={12} />
                            ) : (
                              <ArrowUpDown size={12} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualize ? (
              <>
                {rowVirtualizer.getVirtualItems().length > 0 ? (
                  <>
                    <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start || 0}px` }}>
                      <td colSpan={columns.length} style={{ padding: 0, border: 0 }} />
                    </tr>
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index];
                      return (
                        <tr
                          key={row.id}
                          onClick={() => onRowClick?.(row.original)}
                          className={onRowClick ? styles.clickableRow : ''}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    <tr
                      style={{
                        height: `${
                          rowVirtualizer.getTotalSize() -
                          (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end || 0)
                        }px`,
                      }}
                    >
                      <td colSpan={columns.length} style={{ padding: 0, border: 0 }} />
                    </tr>
                  </>
                ) : null}
              </>
            ) : (
              rows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? styles.clickableRow : ''}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!virtualize && (
        <div className={styles.pagination}>
          <div className={styles.pageJumpGroup}>
            <span className={styles.pageLabel}>Go to page:</span>
            <input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleJumpToPage();
              }}
              onBlur={handleJumpToPage}
              className={styles.pageInput}
              aria-label="Jump to page number"
            />
            <span className={styles.pageTotal}>
              of <strong>{table.getPageCount()}</strong> ({data.length} total)
            </span>
          </div>

          <div className={styles.pageActions}>
            <button
              className={styles.pageBtn}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="First Page"
              aria-label="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Next Page"
              aria-label="Next Page"
            >
              Next <ChevronRight size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="Last Page"
              aria-label="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
