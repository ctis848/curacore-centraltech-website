// FILE: app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon },
  { label: "Licenses", href: "/admin/licenses", icon: KeyIcon },
  { label: "License Requests", href: "/admin/license-requests", icon: ClipboardDocumentListIcon },
  { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },
  { label: "Annual Fees", href: "/admin/annual-fees", icon: CurrencyDollarIcon },
  { label: "Renewals", href: "/admin/renewals", icon: ClockIcon },
  { label: "Renewal Analytics", href: "/admin/renewals/analytics", icon: ChartBarIcon },
  { label: "Tenants", href: "/admin/tenants", icon: BuildingOfficeIcon },
  { label: "Users", href: "/admin/users", icon: UserGroupIcon },
  { label: "Support", href: "/admin/support", icon: ChatBubbleLeftRightIcon },

  // Correct Coupons root
  { label: "Coupons", href: "/admin/coupons", icon: TagIcon },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-slate-900">CentralCore Admin</h1>
          <p className="text-xs text-slate-500">Management Console</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition
                  ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          action="/api/auth/admin-logout"
          method="post"
          className="px-4 py-4 border-t"
        >
          <button className="w-full text-left px-3 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-50">
            Logout
          </button>
        </form>
      </aside>

      {/* MOBILE SIDEBAR */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute top-3 left-3 z-50 bg-white border rounded px-3 py-1 shadow"
          aria-label="Toggle admin menu"
        >
          ☰
        </button>

        {open && (
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-lg z-40 flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h1 className="text-lg font-bold text-slate-900">Admin Menu</h1>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                ✕
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition
                      ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <form
              action="/api/auth/admin-logout"
              method="post"
              className="px-4 py-4 border-t"
            >
              <button className="w-full text-left px-3 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-50">
                Logout
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between md:hidden">
          <h1 className="text-lg font-semibold text-slate-900">CentralCore Admin</h1>
          <form action="/api/auth/admin-logout" method="post">
            <button className="text-red-600 text-sm font-medium">Logout</button>
          </form>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
