"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useState } from "react";

// Icons
import {
  HomeIcon,
  KeyIcon,
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  InboxIcon,
  ChartBarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  HeartIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon },

  // Licensing
  { label: "License Requests", href: "/admin/license-requests", icon: KeyIcon },
  { label: "Generate License", href: "/admin/generate-license", icon: KeyIcon },
  { label: "Clients", href: "/admin/clients", icon: UsersIcon },
  { label: "Licenses", href: "/admin/licenses", icon: DocumentTextIcon },

  // Payments
  { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },

  // Logs & Monitoring
  { label: "Validation Logs", href: "/admin/validation-logs", icon: MagnifyingGlassIcon },
  { label: "Activity Logs", href: "/admin/activity", icon: InboxIcon },
  { label: "Audit Trails", href: "/admin/audit", icon: ChartBarIcon },

  // Analytics
  { label: "License Analytics", href: "/admin/license-analytics", icon: ChartPieIcon },
  { label: "Revenue Insights", href: "/admin/revenue-insights", icon: ChartBarIcon },
  { label: "Client Insights", href: "/admin/client-insights", icon: ChartBarIcon },

  // Advanced Intelligence
  { label: "Geo‑IP Map", href: "/admin/geo-map", icon: GlobeAltIcon },
  { label: "Health Dashboard", href: "/admin/health", icon: HeartIcon },
  { label: "Fraud Detection", href: "/admin/fraud-detection", icon: ShieldCheckIcon },

  // Email
  { label: "Email Queue", href: "/admin/email", icon: EnvelopeIcon },
];

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className={`
        h-screen bg-slate-900 text-white p-4 fixed left-0 top-0 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Title */}
      {!collapsed && (
        <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
      )}

      {/* Search Bar */}
      {!collapsed && (
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-slate-800 text-sm outline-none"
        />
      )}

      {/* Navigation */}
      <nav className="space-y-2 flex-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded transition-all
                ${active ? "bg-slate-700" : "hover:bg-slate-800"}
              `}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-slate-700">
        <LogoutButton />
      </div>
    </aside>
  );
}
