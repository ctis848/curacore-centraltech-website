"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

// Icons (Heroicons)
import {
  HomeIcon,
  KeyIcon,
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  InboxIcon,
  ChartBarIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon },
  { label: "License Requests", href: "/admin/license-requests", icon: KeyIcon },
  { label: "Clients", href: "/admin/clients", icon: UsersIcon },
  { label: "Licenses", href: "/admin/licenses", icon: DocumentTextIcon },
  { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },
  { label: "Activity Logs", href: "/admin/activity", icon: InboxIcon },
  { label: "Audit Trails", href: "/admin/audit", icon: ChartBarIcon },
  { label: "Email Queue", href: "/admin/email", icon: EnvelopeIcon },
  { label: "Insights", href: "/admin/client-insights", icon: ChartBarIcon },
];

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        h-screen bg-slate-900 text-white p-4 fixed left-0 top-0 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Title */}
      <h1
        className={`
          text-xl font-bold mb-6 whitespace-nowrap overflow-hidden transition-opacity duration-300
          ${collapsed ? "opacity-0" : "opacity-100"}
        `}
      >
        Admin Panel
      </h1>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors
                ${active ? "bg-slate-700" : "hover:bg-slate-800"}
              `}
            >
              <Icon className="w-5 h-5" />

              {/* Hide labels when collapsed */}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 border-t border-slate-700">
        <LogoutButton />
      </div>
    </aside>
  );
}
