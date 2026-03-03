'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiLayers, FiCpu, FiClock, FiSettings, FiUser, FiX } from 'react-icons/fi';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: <FiHome /> },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: <FiLayers /> },
    { name: 'Machines', href: '/dashboard/machines', icon: <FiCpu /> },
    { name: 'History', href: '/dashboard/history', icon: <FiClock /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <FiSettings /> },
    { name: 'Profile', href: '/profile', icon: <FiUser /> },
  ];

  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition ${
          mobileOpen ? 'block' : 'hidden'
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-teal-100 z-50
          transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          className="lg:hidden absolute top-4 right-4 text-teal-700"
          onClick={onCloseMobile}
        >
          <FiX size={24} />
        </button>

        <div className="p-6">
          <h1
            className={`text-2xl font-bold text-teal-700 mb-8 transition-opacity ${
              collapsed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            CentralCore
          </h1>

          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                    active
                      ? 'bg-teal-600 text-white shadow'
                      : 'text-teal-800 hover:bg-teal-50'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {!collapsed && link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
