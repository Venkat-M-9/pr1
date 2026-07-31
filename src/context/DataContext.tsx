'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  generateRecords,
  generateEntries,
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

  return (
    <DataContext.Provider
      value={{
        records,
        entries,
        importRecords,
        importEntries,
        addRecord,
        addEntry,
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
