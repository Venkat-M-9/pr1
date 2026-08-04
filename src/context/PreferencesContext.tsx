'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';

interface PreferencesContextType {
  pageSize: number;
  setPageSize: (size: number) => void;
  virtualizationEnabled: boolean;
  setVirtualizationEnabled: (enabled: boolean) => void;
  compactDensity: boolean;
  setCompactDensity: (compact: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [pageSize, setPageSize] = useLocalStorage('pref_page_size', 20);
  const [virtualizationEnabled, setVirtualizationEnabled] = useLocalStorage('pref_virtualization', true);
  const [compactDensity, setCompactDensity] = useLocalStorage('pref_compact', false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('pref_notifications', true);

  // Sync compact density attribute with HTML body for Challenge 9
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (compactDensity) {
        document.body.setAttribute('data-density', 'compact');
      } else {
        document.body.removeAttribute('data-density');
      }
    }
  }, [compactDensity]);

  return (
    <PreferencesContext.Provider
      value={{
        pageSize,
        setPageSize,
        virtualizationEnabled,
        setVirtualizationEnabled,
        compactDensity,
        setCompactDensity,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
