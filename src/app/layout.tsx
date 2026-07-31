import type { Metadata } from 'next';
import '@/styles/globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'System Console — Enterprise App Router',
  description: 'High-performance Next.js 16 monochrome application built for large datasets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
