'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `block px-5 py-3 rounded-xl font-medium transition-all ${
      pathname === path
        ? 'bg-teal-700 text-white shadow-md'
        : 'text-teal-800 hover:bg-teal-100 hover:text-teal-900'
    }`;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-24 left-4 z-50 bg-teal-700 text-white px-4 py-2 rounded-xl shadow-lg"
      >
        Menu
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white/90 backdrop-blur-md border-r border-teal-200 pt-28 px-4 z-40
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <nav className="space-y-2">
          <Link href="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>

          <Link href="/dashboard/subscriptions" className={linkClass('/dashboard/subscriptions')}>
            Subscriptions
          </Link>

          <Link href="/dashboard/machines" className={linkClass('/dashboard/machines')}>
            Machines
          </Link>

          <Link href="/dashboard/history" className={linkClass('/dashboard/history')}>
            License History
          </Link>

          <Link href="/dashboard/activate" className={linkClass('/dashboard/activate')}>
            Activate License
          </Link>

          <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')}>
            Settings
          </Link>
        </nav>
      </aside>
    </>
  );
}
