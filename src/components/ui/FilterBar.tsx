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

import { useState, useRef, useEffect } from 'react';

function CustomSelect({
  group,
  value,
  onChange
}: {
  group: FilterGroup;
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = group.options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : `${group.label}: All`;

  return (
    <div className={styles.customSelect} ref={containerRef}>
      <button
        type="button"
        className={`${styles.selectBtn} ${isOpen ? styles.selectBtnActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.selectVal}>{displayLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div
            className={`${styles.dropdownItem} ${!value ? styles.activeItem : ''}`}
            onClick={() => { onChange(''); setIsOpen(false); }}
          >
            {group.label}: All
          </div>
          {group.options.map(opt => (
            <div
              key={opt.value}
              className={`${styles.dropdownItem} ${value === opt.value ? styles.activeItem : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
          <CustomSelect
            key={fg.id}
            group={fg}
            value={selectedFilters[fg.id] || ''}
            onChange={(val) => onFilterChange?.(fg.id, val)}
          />
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
