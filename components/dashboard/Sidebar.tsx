"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, FileText, KeyRound, Settings, X } from "lucide-react";

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/license", label: "License", icon: KeyRound },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed z-50 h-full bg-white border-r shadow-sm transition-all",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-teal-700">
            {collapsed ? "CC" : "CentralCore"}
          </span>

          <button className="lg:hidden" onClick={onCloseMobile}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition",
                pathname.startsWith(href)
                  ? "bg-teal-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
