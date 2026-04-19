"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const navItems = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/licenses", label: "Licenses" },
  { href: "/client/licenses/renew", label: "Renew Licenses" },
  { href: "/client/licenses/request", label: "Request License Key" },
  { href: "/client/licenses/transfer", label: "Transfer License" },
  { href: "/client/invoices", label: "Invoices" },
  { href: "/client/support", label: "Support" },
];

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser(); // ✅ FIXED

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/client/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <span className="block h-0.5 w-5 bg-slate-800 mb-1" />
              <span className="block h-0.5 w-5 bg-slate-800 mb-1" />
              <span className="block h-0.5 w-5 bg-slate-800" />
            </button>

            <span className="font-semibold text-slate-900 tracking-tight">
              EMR Client Portal
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    active
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Mobile Slideout */}
        {open && (
          <div className="md:hidden border-t bg-white">
            <nav className="flex flex-col px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`text-sm font-medium block ${
                      active
                        ? "text-blue-600"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="mt-2 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 text-left"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
