'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">

      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div
        className={`
          flex-1 min-h-screen transition-all duration-300
          bg-gray-50
          ${collapsed ? 'ml-20' : 'ml-64'}
          md:ml-0 md:pl-0
        `}
      >
        {/* TOPBAR */}
        <Topbar
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed(!collapsed)}
          openMobile={() => setMobileOpen(true)}
        />

        {/* PAGE CONTENT */}
        <main className="p-4 sm:p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
