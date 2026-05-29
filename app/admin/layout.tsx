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
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// -----------------------------
// TYPES
// -----------------------------
type NavSection = { section: string; icon: ElementType; key: string };
type NavItem = {
  label: string;
  href: string;
  icon: ElementType;
  roles?: string[];
  logout?: boolean;
};
type NavEntry = NavSection | NavItem;

// -----------------------------
// ROLE (Replace with real auth later)
// -----------------------------
const userRole = "superadmin";

// -----------------------------
// NAV ITEMS
// -----------------------------
const navItems: NavEntry[] = [
  { section: "General", icon: HomeIcon, key: "general" },
  { label: "Dashboard", href: "/admin", icon: HomeIcon },

  { section: "Licensing", icon: KeyIcon, key: "licensing" },
  { label: "Licenses", href: "/admin/licenses", icon: KeyIcon },
  { label: "Active Licenses", href: "/admin/active-licenses", icon: KeyIcon },
  { label: "License Requests", href: "/admin/license-requests", icon: ClipboardDocumentListIcon },
  { label: "Send License", href: "/admin/send-license", icon: KeyIcon, roles: ["admin", "superadmin"] },

  { section: "Finance", icon: CurrencyDollarIcon, key: "finance" },
  { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },
  { label: "Annual Fees", href: "/admin/annual-fees", icon: CurrencyDollarIcon },
  { label: "Renewals", href: "/admin/renewals", icon: ClockIcon },
  { label: "Renewal Analytics", href: "/admin/renewals/analytics", icon: ChartBarIcon },

  { section: "Transfer Payments", icon: BanknotesIcon, key: "transfers" },
  { label: "Transfer Approvals", href: "/admin/transfers", icon: BanknotesIcon },

  { section: "Clients & Purchases", icon: UserGroupIcon, key: "clients" },
  { label: "Clients", href: "/admin/clients", icon: UserGroupIcon },
  { label: "License Purchases", href: "/admin/license-purchases", icon: DocumentDuplicateIcon },
  { label: "Invoices", href: "/admin/invoices", icon: DocumentTextIcon },

  { section: "On‑Site Support", icon: WrenchScrewdriverIcon, key: "onsite" },
  { label: "Service Requests", href: "/admin/service-requests", icon: ClipboardDocumentCheckIcon },
  { label: "Service Analytics", href: "/admin/service-analytics", icon: ChartBarIcon },

  { section: "Management", icon: Cog6ToothIcon, key: "management" },
  { label: "Tenants", href: "/admin/tenants", icon: BuildingOfficeIcon },
  { label: "Users", href: "/admin/users", icon: UserGroupIcon, roles: ["superadmin"] },
  { label: "Support", href: "/admin/support", icon: ChatBubbleLeftRightIcon },
  { label: "Coupons", href: "/admin/coupons", icon: TagIcon },

  { label: "Logout", href: "/api/auth/admin-logout", icon: XMarkIcon, logout: true },
];

// -----------------------------
// FILTER BY ROLE
// -----------------------------
const visibleItems = navItems.filter((item) => {
  if ("section" in item) return true;
  if (!item.roles) return true;
  return item.roles.includes(userRole);
});

// -----------------------------
// COMPONENT
// -----------------------------
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const isActive = (href: string) => pathname?.startsWith(href);

  const toggleSection = (key: string) => {
    setExpanded(expanded === key ? null : key);
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
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item, index) => {
            if ("section" in item) {
              const SectionIcon = item.icon;
              const isOpen = expanded === item.key;

              return (
                <div key={`section-${index}`} className="mt-4">
                  <button
                    onClick={() => toggleSection(item.key)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold tracking-wide
                      ${collapsed ? "justify-center" : ""}
                      ${isOpen ? "text-blue-600" : "text-slate-500"}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <SectionIcon className="w-4 h-4" />
                      {!collapsed && item.section}
                    </span>

                    {!collapsed &&
                      (isOpen ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      ))}
                  </button>
                </div>
              );
            }

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
                <Icon className="w-5 h-5" />
                {!collapsed && item.label}
              </div>
            );

            if (item.logout) {
              return (
                <form key={item.href} action="/api/auth/admin-logout" method="post">
                  <button className="w-full text-left">{content}</button>
                </form>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                {content}
              </Link>
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
            {visibleItems.map((item, index) => {
              if ("section" in item) {
                return (
                  <div key={`m-section-${index}`} className="text-xs font-semibold text-slate-500 mt-4 mb-1 px-3">
                    {item.section}
                  </div>
                );
              }

              const active = isActive(item.href);
              const Icon = item.icon;

              if (item.logout) {
                return (
                  <form key={item.href} action="/api/auth/admin-logout" method="post">
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
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

        <main className="p-6">
          {/* PAGE TITLE (NEW) */}
          <h1 className="text-2xl font-bold mb-4 text-slate-800">
            {pathname?.split("/").pop()?.replace("-", " ").toUpperCase()}
          </h1>

          {children}
        </main>
      </div>
    </div>
  );
}
