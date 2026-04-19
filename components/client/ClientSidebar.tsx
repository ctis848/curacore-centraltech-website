"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Home,
  Key,
  CheckCircle,
  Monitor,
  CreditCard,
  FileText,
  RefreshCcw,
  Headphones,
  User,
  LogOut,
  Menu,
  X,
  ArrowRightLeft,
  History,
} from "lucide-react";

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load user email
  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUserEmail(session?.user?.email || null);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth/client/login");
  }

  // Sidebar structure
  const sections = [
    {
      title: "Dashboard",
      items: [{ href: "/client", label: "Dashboard", icon: Home }],
    },
    {
      title: "Licensing",
      items: [
        {
          href: "/client/license-request",
          label: "Send License Request Key",
          icon: Key,
        },
        {
          href: "/client/active-licenses",
          label: "Active Licenses",
          icon: CheckCircle,
        },
        {
          href: "/client/machine-history",
          label: "Machine History",
          icon: Monitor,
        },
        {
          href: "/client/transfer-requests",
          label: "Transfer Requests",
          icon: ArrowRightLeft,
        },
      ],
    },
    {
      title: "Billing",
      items: [
        {
          href: "/client/payment-history",
          label: "Payment History",
          icon: CreditCard,
        },
        {
          href: "/client/invoice-history",
          label: "Invoice History",
          icon: FileText,
        },
        {
          href: "/client/renew-annual",
          label: "Renew Annual Payment",
          icon: RefreshCcw,
        },
        {
          href: "/client/renewal-history",
          label: "Renewal History",
          icon: History,
        },
      ],
    },
    {
      title: "Support",
      items: [
        { href: "/client/support", label: "Contact Support", icon: Headphones },
      ],
    },
    
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded"
        aria-label="Toggle Sidebar"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-700">
          <h1 className="text-xl font-bold">Client Portal</h1>
          {userEmail && (
            <p className="text-sm text-slate-400 mt-1">{userEmail}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs uppercase text-slate-500 px-3 mb-1 tracking-wide">
                {section.title}
              </p>

              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${
                      active
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="m-3 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold flex items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}
