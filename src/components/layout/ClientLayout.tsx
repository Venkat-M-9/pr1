'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ToastContainer from '@/components/ui/ToastContainer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        {children}
      </div>
      <ToastContainer />
    </div>
  );
}
