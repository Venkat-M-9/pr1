'use client';

import ResourceTable, { ResourceTableProps } from '@/components/table/ResourceTable';

export type DataGridProps<TData> = ResourceTableProps<TData>;

export default function DataGrid<TData extends Record<string, any>>(props: DataGridProps<TData>) {
  return <ResourceTable<TData> {...props} />;
}
