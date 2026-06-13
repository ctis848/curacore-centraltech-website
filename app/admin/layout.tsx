"use client";

import type { ReactNode, ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  HomeIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

/* -----------------------------
   ROLE (dynamic in real system)
------------------------------*/
const userRole = "superadmin";

/* -----------------------------
   NAV STRUCTURE
------------------------------*/
type NavItem = {
  label: string;
  href: string;
  icon: ElementType;
  roles?: string[];
  logout?: boolean;
};

type NavGroup = {
  section: string;
  items: NavItem[];
};

const navItems: NavGroup[] = [
  {
    section: "General",
    items: [{ label: "Dashboard", href: "/admin", icon: HomeIcon }],
  },

  {
    section: "Licensing System",
    items: [
      { label: "License Overview", href: "/admin/license-overview", icon: ChartBarIcon },
      { label: "Machine History", href: "/admin/machine-history", icon: WrenchScrewdriverIcon },
      { label: "Active Licenses", href: "/admin/active-licenses", icon: KeyIcon },
      { label: "License Requests", href: "/admin/license-requests", icon: ClipboardDocumentListIcon },
      { label: "Renewals", href: "/admin/renewals", icon: ClockIcon },
    ],
  },

  {
    section: "Finance",
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },
      { label: "Invoices", href: "/admin/invoices", icon: DocumentTextIcon },
    ],
  },

  {
    section: "Companies",
    items: [{ label: "Companies", href: "/admin/company", icon: BuildingOfficeIcon }],
  },

  {
    section: "Support",
    items: [
      { label: "Support Tickets", href: "/admin/support", icon: ChatBubbleLeftRightIcon },
      { label: "Service Requests", href: "/admin/service-requests", icon: ClipboardDocumentCheckIcon },
    ],
  },

  {
    section: "Management",
    items: [
      { label: "Coupons", href: "/admin/coupons", icon: TagIcon },
      { label: "Cron Logs", href: "/admin/cron-logs", icon: ClockIcon, roles: ["superadmin"] },
      { label: "Users", href: "/admin/users", icon: UserGroupIcon, roles: ["superadmin"] },
    ],
  },

  {
    section: "Account",
    items: [
      { label: "Logout", href: "/api/auth/admin-logout", icon: XMarkIcon, logout: true },
    ],
  },
];

/* -----------------------------
   COMPONENT
------------------------------*/
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-slate-200">

      {/* SIDEBAR (DESKTOP) */}
      <aside
        className={`hidden md:flex flex-col border-r bg-white shadow-xl sticky top-0 h-screen transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* HEADER */}
        <div className="px-4 py-5 border-b flex items-center justify-between sticky top-0 bg-white z-20">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                CentralCore Admin
              </h1>
              <p className="text-xs text-slate-500">Management Console</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Bars3Icon className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map((group, index) => {
            const isOpen = openSections[group.section] ?? true;

            return (
              <div key={index} className="mb-2">

                {/* SECTION HEADER */}
                <button
                  onClick={() => toggleSection(group.section)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:bg-slate-100 rounded-lg transition"
                >
                  <span>{group.section}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {/* SECTION ITEMS */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {group.items
                    .filter((item) => !item.roles || item.roles.includes(userRole))
                    .map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;

                      const content = (
                        <div
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${
                              active
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-[1.03]"
                                : "text-slate-700 hover:bg-slate-100"
                            }
                          `}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              active ? "text-white" : "text-slate-600"
                            }`}
                          />
                          {!collapsed && item.label}
                        </div>
                      );

                      if (item.logout) {
                        return (
                          <form
                            key={item.href}
                            action="/api/auth/admin-logout"
                            method="POST"
                            className="w-full"
                          >
                            <button type="submit" className="w-full text-left">
                              {content}
                            </button>
                          </form>
                        );
                      }

                      return (
                        <Link key={item.href} href={item.href}>
                          {content}
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-2xl z-40 flex flex-col md:hidden animate-slideIn">
          <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
            <h1 className="text-lg font-bold text-slate-900">Admin Menu</h1>
            <button onClick={() => setMobileOpen(false)}>
              <XMarkIcon className="w-6 h-6 text-slate-700" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((group, index) => (
              <div key={index}>
                <div className="text-xs font-semibold text-slate-500 mt-4 mb-1 px-3">
                  {group.section}
                </div>

                {group.items
                  .filter((item) => !item.roles || item.roles.includes(userRole))
                  .map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    if (item.logout) {
                      return (
                        <form
                          key={item.href}
                          action="/api/auth/admin-logout"
                          method="POST"
                          className="w-full"
                        >
                          <button
                            type="submit"
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left
                              ${
                                active
                                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                  : "text-slate-700 hover:bg-slate-100"
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </button>
                        </form>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                          ${
                            active
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden p-4 flex justify-between items-center bg-white shadow">
          <h1 className="text-lg font-bold text-slate-900">Admin</h1>
          <button onClick={() => setMobileOpen(true)}>
            <Bars3Icon className="w-7 h-7 text-slate-700" />
          </button>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
