"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileClock,
  KeyRound,
  Users,
  ListChecks,
  CreditCard,
  AlertTriangle,
  Building2,
  Palette,
  FileDown,
  Activity,
} from "lucide-react";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/license-requests", label: "License Requests", icon: FileClock },
    { href: "/admin/licenses", label: "Licenses", icon: KeyRound },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ListChecks },
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
    // AI Search removed
    { href: "/admin/errors", label: "Error Monitoring", icon: AlertTriangle },
    { href: "/admin/tenants", label: "Tenants", icon: Building2 },
    { href: "/admin/themes", label: "Themes", icon: Palette },
    { href: "/admin/export", label: "CSV Export", icon: FileDown },
    { href: "/admin/system-logs", label: "System Logs", icon: Activity },
  ];

  const linkClass = (path: string) =>
    pathname === path
      ? "flex items-center gap-3 px-3 py-2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
      : "flex items-center gap-3 px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-gray-900 shadow-md p-4 transition-all duration-300`}
    >
      {!collapsed && (
        <h2 className="text-2xl font-bold mb-8 dark:text-white">
          Admin Panel
        </h2>
      )}

      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon size={20} />
            {!collapsed && label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
