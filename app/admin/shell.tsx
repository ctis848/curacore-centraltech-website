"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

interface AdminShellProps {
  user: {
    name?: string | null;
    email?: string;
  } | null;
  children: ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden">
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg">
            <Sidebar collapsed={false} />
          </div>
          <div
            className="absolute inset-0"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar
          user={user ?? undefined}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          onToggleMobile={() => setMobileOpen(true)}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          darkMode={darkMode}
        />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
