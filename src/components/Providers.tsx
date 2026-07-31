'use client';

import { ThemeProvider } from 'next-themes';
import { DataProvider } from '@/context/DataContext';
import ClientLayout from '@/components/layout/ClientLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <DataProvider>
        <ClientLayout>{children}</ClientLayout>
      </DataProvider>
    </ThemeProvider>
  );
}
