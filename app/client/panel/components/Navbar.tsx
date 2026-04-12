"use client";

import { useState, useEffect } from "react";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [licenseMenu, setLicenseMenu] = useState(false);
  const pathname = usePathname();

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (path: string) =>
    pathname === path ? "text-blue-600 font-semibold" : "hover:text-blue-600";

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

        <Link href="/client/panel" className={isActive("/client/panel")}>
          Dashboard
        </Link>

        {/* Licenses Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-blue-600">
            Licenses <FiChevronDown className="text-sm" />
          </button>

          <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg mt-2 w-48 z-50">
            <MenuItem href="/client/panel/licenses/active" label="Active" />
            <MenuItem href="/client/panel/licenses/pending" label="Pending" />
            <MenuItem href="/client/panel/licenses/expired" label="Expired" />
            <MenuItem href="/client/panel/licenses/all" label="All Licenses" />
          </div>
        </div>

        <Link href="/client/panel/billing" className={isActive("/client/panel/billing")}>
          Billing
        </Link>

        <Link href="/client/panel/settings" className={isActive("/client/panel/settings")}>
          Settings
        </Link>

        <Link href="/client/panel/support" className={isActive("/client/panel/support")}>
          Support
        </Link>

        <Link href="/logout" className="text-red-600 hover:text-red-700">
          Logout
        </Link>
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
            className="absolute top-0 left-0 w-72 h-full bg-white dark:bg-gray-900 shadow-lg p-6 flex flex-col gap-6 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="text-2xl self-end text-gray-700 dark:text-gray-300"
              onClick={() => setOpen(false)}
            >
              <FiX />
            </button>

            <MobileItem href="/client/panel" label="Dashboard" onClick={() => setOpen(false)} />

            {/* Mobile License Dropdown */}
            <div>
              <button
                className="flex items-center justify-between w-full text-lg"
                onClick={() => setLicenseMenu((v) => !v)}
              >
                Licenses <FiChevronDown className={`transition ${licenseMenu ? "rotate-180" : ""}`} />
              </button>

              {licenseMenu && (
                <div className="ml-4 mt-2 flex flex-col gap-3">
                  <MobileItem href="/client/panel/licenses/active" label="Active" onClick={() => setOpen(false)} />
                  <MobileItem href="/client/panel/licenses/pending" label="Pending" onClick={() => setOpen(false)} />
                  <MobileItem href="/client/panel/licenses/expired" label="Expired" onClick={() => setOpen(false)} />
                  <MobileItem href="/client/panel/licenses/all" label="All Licenses" onClick={() => setOpen(false)} />
                </div>
              )}
            </div>

            <MobileItem href="/client/panel/billing" label="Billing" onClick={() => setOpen(false)} />
            <MobileItem href="/client/panel/settings" label="Settings" onClick={() => setOpen(false)} />
            <MobileItem href="/client/panel/support" label="Support" onClick={() => setOpen(false)} />

            <MobileItem href="/logout" label="Logout" className="text-red-600" onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}

function MenuItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
    >
      {label}
    </Link>
  );
}

function MobileItem({
  href,
  label,
  className = "",
  onClick,
}: {
  href: string;
  label: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-lg ${className}`}
    >
      {label}
    </Link>
  );
}
