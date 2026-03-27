"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Split path into parts: "/admin/users/edit" → ["admin", "users", "edit"]
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-600 dark:text-gray-300 mb-4">
      <ol className="flex gap-2 items-center flex-wrap">
        {/* Home link */}
        <li>
          <Link href="/admin" className="hover:underline">
            Home
          </Link>
        </li>

        {/* Dynamic breadcrumb segments */}
        {parts.slice(1).map((part, index) => {
          const href = "/" + parts.slice(0, index + 2).join("/");

          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={href}
                className="hover:underline capitalize"
              >
                {part.replace(/-/g, " ")}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
