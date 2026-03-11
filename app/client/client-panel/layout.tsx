"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DocumentIcon,
  ClockIcon,
  CpuChipIcon,
  KeyIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function ClientDashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    // Do NOT call Supabase here
    // Let the logout API route handle it
    window.location.href = "/client/login";
  }

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* MOBILE HAMBURGER */}
      <button
        className="md:hidden p-4 fixed top-2 left-2 z-50 bg-white rounded-lg shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full bg-white shadow-xl border-r p-6 flex flex-col w-64 z-40
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* USER PROFILE */}
        <div className="relative mb-6">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <UserCircleIcon className="h-8 w-8 text-teal-700" />
            <span className="font-semibold text-gray-800">My Account</span>
          </button>

          {profileOpen && (
            <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg border p-3 space-y-2">
              <Link
                href="/client/client-panel/settings"
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 text-red-600"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-teal-700 mb-6">Client Panel</h2>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1">

          <SidebarLink
            href="/client/client-panel/active-licenses"
            active={pathname.includes("/active-licenses")}
            icon={<DocumentIcon className="icon" />}
            label="Active Licenses"
          />

          <SidebarLink
            href="/client/client-panel/invoices"
            active={pathname.includes("/invoices")}
            icon={<ClockIcon className="icon" />}
            label="Invoices"
          />

          <SidebarLink
            href="/client/client-panel/license-history"
            active={pathname.includes("/license-history")}
            icon={<DocumentIcon className="icon" />}
            label="License History"
          />

          <SidebarLink
            href="/client/client-panel/machine-history"
            active={pathname.includes("/machine-history")}
            icon={<CpuChipIcon className="icon" />}
            label="Machine History"
          />

          <SidebarLink
            href="/client/client-panel/activate-license"
            active={pathname.includes("/activate-license")}
            icon={<KeyIcon className="icon" />}
            label="Activate License"
          />

          <SidebarLink
            href="/client/client-panel/support"
            active={pathname.includes("/support")}
            icon={<LifebuoyIcon className="icon" />}
            label="Support"
          />

          <SidebarLink
            href="/client/client-panel/settings"
            active={pathname.includes("/settings")}
            icon={<Cog6ToothIcon className="icon" />}
            label="Settings"
          />
        </nav>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="sidebar-link text-red-600 hover:text-red-700 mt-4 flex items-center gap-3"
        >
          <ArrowLeftOnRectangleIcon className="icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`sidebar-link flex items-center gap-3 ${
        active ? "sidebar-link-active" : ""
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

