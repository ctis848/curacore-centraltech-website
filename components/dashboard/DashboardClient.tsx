"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiFileText,
  FiClock,
  FiCpu,
  FiHelpCircle,
  FiSettings,
  FiBell,
  FiKey,
  FiLogOut,
  FiLayers,
  FiArchive,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { createSupabaseClient } from "@/lib/supabase/client";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";

export default function DashboardClient({ children }: { children?: React.ReactNode }) {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AUTH CHECK
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) router.replace("/auth/client/login");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session && event !== "INITIAL_SESSION") {
          router.replace("/auth/client/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // LOCK SCROLL WHEN SIDEBAR OPEN
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/auth/client/login");
  };

  const menuGroups = [
    {
      label: "Licenses",
      items: [
        { title: "Dashboard", icon: <FiHome />, href: "/client/panel" },
        { title: "My Licenses", icon: <FiFileText />, href: "/client/panel/licenses" },
        { title: "Active Licenses", icon: <FiLayers />, href: "/client/panel/active-licenses" },
        { title: "Pending Licenses", icon: <FiClock />, href: "/client/panel/licenses/pending" },
        { title: "Expired Licenses", icon: <FiArchive />, href: "/client/panel/licenses/expired" },
        { title: "License History", icon: <FiClock />, href: "/client/panel/licenses/history" },
        { title: "Activate License", icon: <FiKey />, href: "/client/panel/licenses/activate" },
      ],
    },
    {
      label: "Machines",
      items: [{ title: "Machine History", icon: <FiCpu />, href: "/client/panel/machines" }],
    },
    {
      label: "Billing",
      items: [{ title: "Invoices", icon: <FiFileText />, href: "/client/panel/invoices" }],
    },
    {
      label: "Support",
      items: [
        { title: "Support Tickets", icon: <FiHelpCircle />, href: "/client/panel/support" },
        { title: "Notifications", icon: <FiBell />, href: "/client/panel/notifications" },
      ],
    },
    {
      label: "Account",
      items: [{ title: "Settings", icon: <FiSettings />, href: "/client/panel/settings" }],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading dashboard…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-100 transition-colors duration-300">

      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow px-6 py-4 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-black text-teal-700">Dashboard</h1>

        <button
          className="text-3xl text-gray-700"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu />
        </button>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          bg-white shadow-lg border-r
          transition-all duration-300 ease-in-out
          ${sidebarExpanded ? "w-64" : "w-20"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* LOGO */}
        <Link
          href="/client/panel"
          className="p-6 border-b flex items-center gap-3 hover:opacity-80 transition"
        >
          <span className="text-2xl text-teal-700 font-black">CC</span>
          {sidebarExpanded && (
            <span className="text-xl font-bold text-gray-800">
              CentralCore
            </span>
          )}
        </Link>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {sidebarExpanded && (
                <p className="text-xs uppercase text-gray-500 mb-2 px-2">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium
                        transition-all duration-200 text-left
                        ${
                          isActive
                            ? "bg-teal-100 text-teal-700 border-l-4 border-teal-600"
                            : "text-gray-700 hover:bg-teal-50"
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {sidebarExpanded && <span>{item.title}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* LOGOUT */}
          <div className="pt-6 border-t">
            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium
                text-red-600 hover:bg-red-50
              "
            >
              <FiLogOut className="text-xl" />
              {sidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 mt-24 md:mt-0">
        <div className="bg-white p-6 rounded-xl shadow border mb-8">
          <h2 className="text-3xl font-bold text-teal-800">
            Welcome back
          </h2>
          <p className="text-gray-600 mt-1">
            Logged in as {user.email}
          </p>
        </div>

        {children}
      </main>

      <NotificationsPanel open={notificationsOpen} />
    </div>
  );
}
