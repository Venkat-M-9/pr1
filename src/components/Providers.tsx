'use client';

import { ThemeProvider } from 'next-themes';
import { DataProvider } from '@/context/DataContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ClientLayout from '@/components/layout/ClientLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <PreferencesProvider>
        <NotificationProvider>
          <DataProvider>
            <ClientLayout>{children}</ClientLayout>
          </DataProvider>
        </NotificationProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
