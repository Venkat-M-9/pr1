'use client';

import { ThemeProvider } from 'next-themes';
import ClientLayout from '@/components/layout/ClientLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <ClientLayout>{children}</ClientLayout>
    </ThemeProvider>
  );
}
