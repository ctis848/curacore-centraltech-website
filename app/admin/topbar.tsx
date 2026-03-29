"use client";

import { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import {
  ChevronDown,
  Bell,
  Menu as MenuIcon,
  AlertTriangle,
  Palette,
} from "lucide-react";
import Pusher from "pusher-js";

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string;
  };
  onToggleSidebar?: () => void;
  onToggleMobile?: () => void;
}

export default function Topbar({
  user,
  onToggleSidebar,
  onToggleMobile,
}: TopbarProps) {
  const displayName = user?.name || user?.email || "Admin";

  const [notifications, setNotifications] = useState<any[]>([]);
  const [theme, setTheme] = useState("light");
  const [tenants, setTenants] = useState<any[]>([]);
  const [activeTenant, setActiveTenant] = useState("");

  const safeJson = async (res: Response) => {
    try {
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // Load notifications
  useEffect(() => {
    fetch("/admin/api/notifications")
      .then(safeJson)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, []);

  // Load tenants
  useEffect(() => {
    fetch("/admin/api/tenants")
      .then(safeJson)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTenants(list);
        if (list.length > 0) setActiveTenant(list[0].id);
      })
      .catch(() => setTenants([]));
  }, []);

  // Real‑time notifications via Pusher
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1";

    if (!key) {
      console.warn("Missing Pusher key: NEXT_PUBLIC_PUSHER_KEY");
      return;
    }

    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe("admin-channel");

    channel.bind("new-notification", (data: any) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      pusher.unsubscribe("admin-channel");
      pusher.disconnect();
    };
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow p-4 flex justify-between items-center transition-colors">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <MenuIcon size={22} className="dark:text-white" />
        </button>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <MenuIcon size={22} className="dark:text-white" />
        </button>

        <h1 className="text-xl font-semibold dark:text-white">
          Admin Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Tenant Switcher */}
        <select
          value={activeTenant}
          onChange={(e) => setActiveTenant(e.target.value)}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white"
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700"
        >
          <Palette size={20} className="dark:text-white" />
        </button>

        {/* Alerts */}
        <a
          href="/admin/alerts"
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <AlertTriangle
            size={20}
            className="text-yellow-600 dark:text-yellow-400"
          />
        </a>

        {/* Notifications Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="relative">
            <Bell
              size={22}
              className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
            />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded p-2 z-50">
            {notifications.length === 0 && (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-300">
                No notifications
              </div>
            )}

            {notifications.map((note) => (
              <div
                key={note.id}
                className="px-3 py-2 border-b dark:border-gray-700 last:border-none"
              >
                <p className="text-sm dark:text-white">{note.message}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </Menu.Items>
        </Menu>

        {/* Profile Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            <span className="dark:text-white">{displayName}</span>
            <ChevronDown size={16} className="dark:text-white" />
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded p-2 z-50">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`w-full text-left px-3 py-2 rounded ${
                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                >
                  Profile
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <form action="/api/auth/logout" method="POST">
                  <button
                    className={`w-full text-left px-3 py-2 rounded text-red-600 ${
                      active ? "bg-gray-100 dark:bg-gray-700" : ""
                    }`}
                  >
                    Logout
                  </button>
                </form>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
}
