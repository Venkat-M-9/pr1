'use client';

import { useState, useMemo } from 'react';
import { SortingState } from '@tanstack/react-table';
import { useDebounce } from '@/lib/useDebounce';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface UseTableManagerOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialSorting?: SortingState;
  debounceMs?: number;
}

/**
 * useTableManager — Centralized state management hook for tables (Challenge 3 Reusability).
 * Handles search debouncing, multi-column filtering, sorting, item selection, and pagination stats.
 *
 * @template T
 * @param {UseTableManagerOptions<T>} options Config options for table manager.
 */
export function useTableManager<T extends Record<string, any>>({
  data,
  searchFields = [],
  initialSorting = [{ id: 'id', desc: false }],
  debounceMs = 250,
}: UseTableManagerOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  // Single centralized, performant filtering & search logic for all tables
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search matching across all searchFields
      if (debouncedSearch && searchFields.length > 0) {
        const q = debouncedSearch.toLowerCase();
        const matchesSearch = searchFields.some(field => {
          const val = item[field];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(q);
        });
        if (!matchesSearch) return false;
      }

      // Dynamic filter matching across selectedFilters
      for (const [filterId, filterValue] of Object.entries(selectedFilters)) {
        if (!filterValue) continue;
        const itemVal = item[filterId];
        if (typeof itemVal === 'boolean' || filterValue === 'true' || filterValue === 'false') {
          const boolVal = Boolean(itemVal);
          if (String(boolVal) !== filterValue) return false;
        } else if (String(itemVal) !== String(filterValue)) {
          return false;
        }
      }

      return true;
    });
  }, [data, debouncedSearch, searchFields, selectedFilters]);

  const setFilter = (filterId: string, value: string) => {
    setSelectedFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const resetFilters = () => {
    setSelectedFilters({});
  };

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedFilters,
    setFilter,
    resetFilters,
    sorting,
    setSorting,
    selectedRecord,
    setSelectedRecord,
    clearSelectedRecord: () => setSelectedRecord(null),
    filteredData,
    totalCount: data.length,
    filteredCount: filteredData.length,
  };
}
