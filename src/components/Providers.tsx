'use client';

import { ThemeProvider } from 'next-themes';
import { DataProvider } from '@/context/DataContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import ClientLayout from '@/components/layout/ClientLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <PreferencesProvider>
        <DataProvider>
          <ClientLayout>{children}</ClientLayout>
        </DataProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
