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
  FiMoon,
  FiSun,
  FiBell,
  FiKey,
  FiLogOut,
  FiLayers,
  FiArchive,
} from "react-icons/fi";
import { createSupabaseClient } from "@/lib/supabase/client";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";

export default function DashboardClient({ children }: { children?: React.ReactNode }) {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        router.replace("/auth/client/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (!session && event !== "INITIAL_SESSION") {
        router.replace("/auth/client/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* MOBILE TOPBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-black text-teal-700 dark:text-teal-300">Dashboard</h1>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="text-gray-700 dark:text-gray-200 text-2xl">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          <button
            className="text-gray-700 dark:text-gray-200 text-3xl"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`
          fixed md:static inset-y-0 left-0 z-40
          bg-white dark:bg-gray-800 shadow-lg border-r dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${sidebarExpanded ? "w-64" : "w-20"}
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Link
          href="/client/panel"
          className="p-6 border-b dark:border-gray-700 flex items-center gap-3 hover:opacity-80 transition"
        >
          <span className="text-2xl text-teal-700 dark:text-teal-300 font-black">CC</span>

          {sidebarExpanded && (
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
              CentralCore
            </span>
          )}
        </Link>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {sidebarExpanded && (
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 px-2">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <div key={item.title} className="relative group">
                      {!sidebarExpanded && (
                        <span
                          className="
                            absolute left-20 top-1/2 -translate-y-1/2
                            bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0
                            group-hover:opacity-100 transition-opacity whitespace-nowrap
                          "
                        >
                          {item.title}
                        </span>
                      )}

                      <button
                        onClick={() => router.push(item.href)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium
                          transition-all duration-200 text-left
                          ${
                            isActive
                              ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-l-4 border-teal-600"
                              : "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700"
                          }
                        `}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {sidebarExpanded && <span>{item.title}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium
                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900
              "
            >
              <FiLogOut className="text-xl" />
              {sidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8 mt-24 md:mt-0">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mb-8">
          <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-300">
            Welcome back
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user ? `Logged in as ${user.email}` : "Loading user..."}
          </p>
        </div>

        {children}
      </main>

      <NotificationsPanel open={notificationsOpen} />    </div>
  );
}
