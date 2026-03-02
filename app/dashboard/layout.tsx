'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex-1 min-h-screen bg-gray-50 transition-all ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Topbar
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed(!collapsed)}
          openMobile={() => setMobileOpen(true)}
        />

        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}
