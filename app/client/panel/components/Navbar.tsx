"use client";

import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link
        href="/client/panel"
        className="text-xl font-bold text-gray-900 dark:text-gray-100"
      >
        CentralCore
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-300">
        <Link href="/client/panel" className="hover:text-blue-600">Dashboard</Link>
        <Link href="/client/panel/licenses" className="hover:text-blue-600">Licenses</Link>
        <Link href="/client/panel/billing" className="hover:text-blue-600">Billing</Link>
        <Link href="/client/panel/settings" className="hover:text-blue-600">Settings</Link>
      </div>

      {/* Hamburger Button */}
      <button
        className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
        onClick={() => setOpen(true)}
      >
        <FiMenu />
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute top-0 left-0 w-64 h-full bg-white dark:bg-gray-900 shadow-lg p-6 flex flex-col gap-6 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="text-2xl self-end text-gray-700 dark:text-gray-300"
              onClick={() => setOpen(false)}
            >
              <FiX />
            </button>

            <Link href="/client/panel" className="text-lg" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <Link href="/client/panel/licenses" className="text-lg" onClick={() => setOpen(false)}>
              Licenses
            </Link>
            <Link href="/client/panel/billing" className="text-lg" onClick={() => setOpen(false)}>
              Billing
            </Link>
            <Link href="/client/panel/settings" className="text-lg" onClick={() => setOpen(false)}>
              Settings
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
