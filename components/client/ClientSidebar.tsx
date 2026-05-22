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
  LogOut,
  Menu,
  X,
  ArrowRightLeft,
  History,
  User,
} from "lucide-react";

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) return;

      const user = session.user;
      setUserEmail(user.email || null);

      const { data: profile } = await supabase
        .from("Profile")
        .select("company, fullname")
        .eq("userid", user.id)
        .single();

      if (profile) {
        setCompanyName(profile.company || null);
        setFullName(profile.fullname || null);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth/client/login");
  }

  const sections = [
    {
      title: "Dashboard",
      items: [{ href: "/client", label: "Dashboard", icon: Home }],
    },
    {
      title: "Licensing",
      items: [
        { href: "/client/license-request", label: "Send License Request Key", icon: Key },
        { href: "/client/active-licenses", label: "Active Licenses", icon: CheckCircle },
        { href: "/client/machine-history", label: "Machine History", icon: Monitor },
        { href: "/client/transfer-license", label: "Transfer License", icon: ArrowRightLeft },
        { href: "/client/transfer-requests", label: "Transfer Requests", icon: ArrowRightLeft },
      ],
    },
    {
      title: "Billing",
      items: [
        { href: "/client/payments", label: "Payments", icon: CreditCard },
        { href: "/client/invoice-history", label: "Invoice History", icon: FileText },
        { href: "/client/renew-annual", label: "Renew Annual Payment", icon: RefreshCcw },
        { href: "/client/renewal-history", label: "Renewal History", icon: History },
      ],
    },
    {
      title: "Support",
      items: [{ href: "/client/support", label: "Contact Support", icon: Headphones }],
    },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transition-transform duration-300 z-40 shadow-xl
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="px-4 py-6 border-b border-slate-700 bg-gradient-to-r from-purple-700 to-blue-700 shadow-md">
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <User size={20} /> Client Portal
          </h1>

          {companyName && (
            <p className="text-sm font-semibold mt-2 truncate max-w-[180px] text-slate-200">
              {companyName}
            </p>
          )}

          {fullName && (
            <p className="text-xs text-slate-300 truncate max-w-[180px]">
              {fullName}
            </p>
          )}

          {userEmail && (
            <p className="text-xs text-slate-400 truncate max-w-[180px]">
              {userEmail}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs uppercase text-slate-400 px-2 mb-2 tracking-wider">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-white text-slate-900 shadow-md"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="m-4 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 text-sm font-semibold flex items-center gap-2 text-white shadow-lg"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}
