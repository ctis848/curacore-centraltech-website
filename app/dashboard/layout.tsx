"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  History,
  Monitor,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import Breadcrumbs from "./components/Breadcrumbs";
import NotificationsPanel from "./components/NotificationsPanel";
import SearchBar from "./components/SearchBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const menu = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Active Licenses", href: "/dashboard/license", icon: KeyRound },
    { name: "License History", href: "/dashboard/history", icon: History },
    { name: "Machine History", href: "/dashboard/machines", icon: Monitor },
    { name: "Invoice History", href: "/dashboard/invoices", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const Sidebar = (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}
    >
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">CTIS Portal</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
        {!collapsed && (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">info@ctistech.com</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  active
                    ? "bg-gray-900 text-white shadow-md dark:bg-gray-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              <Icon size={20} />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && (dark ? "Light Mode" : "Dark Mode")}
        </button>

        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          <LogOut size={20} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center z-50">
        <button onClick={() => setMobileOpen(true)}>
          <Menu size={28} className="text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">CTIS Portal</h1>
        <button onClick={() => setNotificationsOpen(true)}>
          <Bell size={24} className="text-gray-800 dark:text-white" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:hidden`}
      >
        {Sidebar}
      </div>

      <div className="hidden lg:block">{Sidebar}</div>

      <NotificationsPanel open={notificationsOpen} setOpen={setNotificationsOpen} />

      <main className="flex-1 p-10 mt-16 lg:mt-0">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumbs />
          <SearchBar />
          <button onClick={() => setNotificationsOpen(true)} className="hidden lg:block">
            <Bell size={24} className="text-gray-800 dark:text-white" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
