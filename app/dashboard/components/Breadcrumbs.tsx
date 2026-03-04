"use client";

import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-600 dark:text-gray-300">
      {parts.map((p, i) => (
        <span key={i}>
          {p.charAt(0).toUpperCase() + p.slice(1)}
          {i < parts.length - 1 && " / "}
        </span>
      ))}
    </nav>
  );
}
