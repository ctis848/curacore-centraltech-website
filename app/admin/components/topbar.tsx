"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

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
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="w-full h-16 bg-white dark:bg-slate-800 shadow flex items-center justify-between px-4 transition-colors">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
          onClick={onToggleMobile}
        >
          <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>

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

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-700 shadow rounded p-3">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                No new notifications
              </p>
            </div>
          )}
        </div>

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
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 shadow rounded">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-slate-600">
                {user?.name ?? "Admin"}
                <br />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email ?? ""}
                </span>
              </div>

              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 text-sm">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 text-sm">
                Settings
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 text-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
