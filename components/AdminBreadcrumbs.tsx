"use client";

import { usePathname } from "next/navigation";

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      {crumbs.map((c, i) => (
        <span key={i}>
          <a href={c.href} className="hover:text-teal-500">{c.label}</a>
          {i < crumbs.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}
