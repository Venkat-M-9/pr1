'use client';

import { useRef } from 'react';
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
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  sorting,
  onSortingChange,
  virtualize = false,
  onRowClick,
  pageSize = 20,
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: onSortingChange ? (updater => {
      const next = typeof updater === 'function' ? updater(sorting || []) : updater;
      onSortingChange(next);
    }) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: !virtualize ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: { pageSize },
    },
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

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
          <span className={styles.pageInfo}>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong>{table.getPageCount()}</strong> ({data.length} total)
          </span>

          <div className={styles.pageActions}>
            <button
              className={styles.pageBtn}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
