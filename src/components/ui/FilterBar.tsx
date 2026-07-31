'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import styles from './FilterBar.module.css';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  filters?: FilterGroup[];
  selectedFilters?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;
  onResetFilters?: () => void;
  actions?: React.ReactNode;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  selectedFilters = {},
  onFilterChange,
  onResetFilters,
  actions,
}: Props) {
  const activeCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <div className={styles.bar}>
      <div className={styles.searchGroup}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button className={styles.clearSearch} onClick={() => onSearchChange('')}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className={styles.filterGroups}>
        {filters.map(fg => (
          <select
            key={fg.id}
            value={selectedFilters[fg.id] || ''}
            onChange={e => onFilterChange?.(fg.id, e.target.value)}
            className={styles.select}
          >
            <option value="">{fg.label}: All</option>
            {fg.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {activeCount > 0 && onResetFilters && (
          <button className={styles.resetBtn} onClick={onResetFilters}>
            <SlidersHorizontal size={13} />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
