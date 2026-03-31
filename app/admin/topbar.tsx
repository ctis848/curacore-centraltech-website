"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationBell";

type UserType = {
  name?: string | null;
  email?: string | null;
};

type TopbarProps = {
  user?: UserType;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
};

export default function Topbar({
  user,
  onToggleSidebar,
  onToggleMobile,
  onToggleTheme,
  darkMode,
}: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="
      w-full h-16 bg-white dark:bg-slate-800 shadow 
      flex items-center justify-between px-4 transition-colors
    ">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
          onClick={onToggleMobile}
        >
          <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          className="hidden md:block p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
          onClick={onToggleSidebar}
        >
          <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Admin Panel
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* Notification Bell (REALTIME) */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
        >
          {darkMode ? (
            <SunIcon className="w-6 h-6 text-yellow-400" />
          ) : (
            <MoonIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <UserCircleIcon className="w-7 h-7 text-gray-700 dark:text-gray-200" />
          </button>

          {profileOpen && (
            <div className="
              absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 
              shadow rounded overflow-hidden
            ">
              {/* User Info */}
              <div className="
                px-4 py-3 text-sm text-gray-700 dark:text-gray-200 
                border-b dark:border-slate-600
              ">
                <p className="font-medium">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email ?? ""}
                </p>
              </div>

              {/* Menu Items */}
              <button className="
                w-full text-left px-4 py-2 text-sm 
                hover:bg-gray-100 dark:hover:bg-slate-600
              ">
                Profile
              </button>

              <button className="
                w-full text-left px-4 py-2 text-sm 
                hover:bg-gray-100 dark:hover:bg-slate-600
              ">
                Settings
              </button>

              <a
                href="/logout"
                className="
                  block w-full text-left px-4 py-2 text-sm 
                  hover:bg-gray-100 dark:hover:bg-slate-600
                "
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
