"use client";

import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import Breadcrumbs from "./components/Breadcrumbs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("admin-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Prevent scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full md:hidden bg-slate-900
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar collapsed={false} />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >
        <Topbar
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onToggleMobile={() => setMobileOpen(true)}
          onToggleTheme={() => setDarkMode(!darkMode)}
          darkMode={darkMode}
        />

        <main className="p-8 text-gray-900 dark:text-gray-100">
          <Breadcrumbs />
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
