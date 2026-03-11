"use client";

import { useState, useEffect } from "react";
import {
  FiHome,
  FiFileText,
  FiClock,
  FiCpu,
  FiHelpCircle,
  FiSettings,
  FiMoon,
  FiSun,
  FiDownload,
} from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";

/* ---------------- LICENSE TABLE COMPONENT ---------------- */

function LicenseTable() {
  const licenses = [
    { id: "LIC-001", product: "CentralCore Pro", status: "Active", expiry: "2026-12-01" },
    { id: "LIC-002", product: "CentralCore Lite", status: "Expired", expiry: "2024-05-10" },
    { id: "LIC-003", product: "CentralCore Enterprise", status: "Pending", expiry: "2025-08-22" },
  ];

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Expired: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">License Overview</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">License ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Product</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Expiry Date</th>
            </tr>
          </thead>

          <tbody>
            {licenses.map((license) => (
              <tr
                key={license.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{license.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{license.product}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[license.status]}`}
                  >
                    {license.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{license.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- INVOICE TABLE COMPONENT ---------------- */

function InvoiceTable() {
  const invoices = [
    { id: "INV-1001", amount: "$199.00", status: "Paid", date: "2025-01-12" },
    { id: "INV-1002", amount: "$49.00", status: "Pending", date: "2025-02-05" },
    { id: "INV-1003", amount: "$299.00", status: "Overdue", date: "2024-12-20" },
  ];

  const statusColors: Record<string, string> = {
    Paid: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Invoices</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Invoice ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Amount</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Date</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Download</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{invoice.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{invoice.amount}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{invoice.date}</td>
                <td className="py-3 px-4">
                  <button className="flex items-center gap-2 text-teal-700 dark:text-teal-300 hover:underline">
                    <FiDownload size={18} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/* ---------------- MACHINE MANAGEMENT TABLE ---------------- */

function MachineTable() {
  const machines = [
    {
      id: "MCH-001",
      name: "Workstation Alpha",
      type: "Windows 11 Pro",
      status: "Online",
      lastActive: "2026-03-10 09:45",
    },
    {
      id: "MCH-002",
      name: "Server Node 3",
      type: "Ubuntu 22.04",
      status: "Offline",
      lastActive: "2026-03-09 22:10",
    },
    {
      id: "MCH-003",
      name: "Laptop Delta",
      type: "macOS Ventura",
      status: "Suspended",
      lastActive: "2026-03-08 14:30",
    },
  ];

  const statusColors: Record<string, string> = {
    Online: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Offline: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    Suspended: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Machine Management
        </h3>

        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition">
          + Add Machine
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Machine ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Name</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Type</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Last Active</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {machines.map((machine) => (
              <tr
                key={machine.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{machine.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{machine.name}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{machine.type}</td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[machine.status]}`}
                  >
                    {machine.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {machine.lastActive}
                </td>

                <td className="py-3 px-4">
                  <button className="text-red-600 dark:text-red-400 hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- NOTIFICATIONS PANEL ---------------- */

function NotificationsPanel({ open }: { open: boolean }) {
  const notifications = [
    { id: 1, text: "Your license LIC-001 will expire soon." },
    { id: 2, text: "New invoice INV-1002 is available." },
    { id: 3, text: "Machine MCH-002 is offline." },
  ];

  return (
    <div
      className={`fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl border dark:border-gray-700 p-4 transition-all duration-300 ${
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Notifications</h4>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200"
          >
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- MAIN DASHBOARD CLIENT ---------------- */

export default function DashboardClient({ user }: { user: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  /* Load saved theme */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  /* Toggle theme */
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

  /* Updated menu items for new route */
  const menuItems = [
    { title: "Active License", icon: <FiHome size={20} />, href: "/client/client-panel" },
    { title: "Invoices", icon: <FiFileText size={20} />, href: "/client/client-panel/invoices" },
    { title: "License History", icon: <FiClock size={20} />, href: "/client/client-panel/license-history" },
    { title: "Machines", icon: <FiCpu size={20} />, href: "/client/client-panel/machines" },
    { title: "Support", icon: <FiHelpCircle size={20} />, href: "/client/client-panel/support" },
    { title: "Settings", icon: <FiSettings size={20} />, href: "/client/client-panel/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* MOBILE NAVBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-black text-teal-700 dark:text-teal-300">Client Panel</h1>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="text-gray-700 dark:text-gray-200 text-2xl">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          <button className="text-gray-700 dark:text-gray-200 text-3xl" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg border-r dark:border-gray-700 z-40 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-2xl font-black text-teal-700 dark:text-teal-300">Client Panel</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={item.title}
                onClick={() => router.push(item.href)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 group text-left
                  ${
                    isActive
                      ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border-l-4 border-teal-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700"
                  }
                `}
              >
                <span
                  className={`
                    transition-transform duration-200
                    ${
                      isActive
                        ? "text-teal-700 dark:text-teal-300 scale-110"
                        : "text-teal-600 dark:text-teal-400 group-hover:scale-110"
                    }
                  `}
                >
                  {item.icon}
                </span>

                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 mt-16 md:mt-0">

        {/* WELCOME HEADER */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mb-8">
          <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-300">Welcome</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {user ? <>Logged in as <strong>{user.email}</strong></> : <span className="text-red-600">No user session found.</span>}
          </p>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[
            ["Active License", "View your current license details."],
            ["Invoices", "Access your billing and payments."],
            ["License History", "Review your past license activity."],
            ["Machines", "Manage your registered machines."],
            ["Support", "Get help and contact support."],
            ["Settings", "Update your account preferences."],
          ].map(([title, desc]) => (
            <div key={title} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{desc}</p>
            </div>
          ))}
        </div>

        {/* LICENSE TABLE */}
        <LicenseTable />

        {/* INVOICE TABLE */}
        <InvoiceTable />

        {/* MACHINE TABLE */}
        <MachineTable />
      </main>
    </div>
  );
}
