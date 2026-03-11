"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function linkClass(pathname: string, href: string): string {
  const active = pathname === href || pathname.startsWith(href + "/");
  return `block px-6 py-3 rounded-lg mb-2 font-semibold ${
    active ? "bg-teal-600 text-white" : "text-gray-700 hover:bg-gray-200"
  }`;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white shadow-xl p-6 border-r border-gray-200">
      <h2 className="text-2xl font-black mb-6">CTIS Admin</h2>

      <nav>
        <Link href="/admin" className={linkClass(pathname, "/admin")}>
          Dashboard Home
        </Link>
        <Link href="/admin/licenses" className={linkClass(pathname, "/admin/licenses")}>
          License Management
        </Link>
        <Link href="/admin/users" className={linkClass(pathname, "/admin/users")}>
          User Management
        </Link>
        <Link href="/admin/logs" className={linkClass(pathname, "/admin/logs")}>
          Activity Logs
        </Link>
        <Link href="/admin/super" className={linkClass(pathname, "/admin/super")}>
          Superadmin Center
        </Link>
      </nav>
    </aside>
  );
}
