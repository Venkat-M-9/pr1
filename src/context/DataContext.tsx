'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  generateRecords,
  generateEntries,
  getPriorityFromValue,
  Record as SystemRecord,
  Entry,
} from '@/lib/mockData';

interface DataContextType {
  records: SystemRecord[];
  entries: Entry[];
  importRecords: (newRecords: SystemRecord[]) => void;
  importEntries: (newEntries: Entry[]) => void;
  addRecord: (record: SystemRecord) => void;
  addEntry: (entry: Entry) => void;
  toggleStarRecord: (id: string) => void;
  updateRecord: (record: SystemRecord) => void;
  deleteRecord: (id: string) => void;
  deleteRecords: (ids: string[]) => void;
  updateRecords: (ids: string[], updates: Partial<SystemRecord>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize master shared datasets (5,000 records, 1,500 entries)
  const [records, setRecords] = useState<SystemRecord[]>(() => generateRecords(5000));
  const [entries, setEntries] = useState<Entry[]>(() => generateEntries(1500));

  const importRecords = (newRecords: SystemRecord[]) => {
    setRecords(prev => [...newRecords, ...prev]);
  };

  const importEntries = (newEntries: Entry[]) => {
    setEntries(prev => [...newEntries, ...prev]);
  };

  const addRecord = (record: SystemRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const addEntry = (entry: Entry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const toggleStarRecord = (id: string) => {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, starred: !r.starred } : r))
    );
  };

  const updateRecord = (updated: SystemRecord) => {
    const priority = getPriorityFromValue(updated.value);
    const updatedRecord = { ...updated, priority, updatedAt: new Date().toISOString().split('T')[0] };
    setRecords(prev =>
      prev.map(r => (r.id === updated.id ? updatedRecord : r))
    );
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const deleteRecords = (ids: string[]) => {
    const set = new Set(ids);
    setRecords(prev => prev.filter(r => !set.has(r.id)));
  };

  const updateRecords = (ids: string[], updates: Partial<SystemRecord>) => {
    const set = new Set(ids);
    const today = new Date().toISOString().split('T')[0];
    setRecords(prev =>
      prev.map(r => {
        if (!set.has(r.id)) return r;
        const nextVal = updates.value !== undefined ? updates.value : r.value;
        const nextPriority = updates.value !== undefined ? getPriorityFromValue(nextVal) : (updates.priority || r.priority);
        return { ...r, ...updates, value: nextVal, priority: nextPriority, updatedAt: today };
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        records,
        entries,
        importRecords,
        importEntries,
        addRecord,
        addEntry,
        toggleStarRecord,
        updateRecord,
        deleteRecord,
        deleteRecords,
        updateRecords,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
