"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts.map((part, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    return { label: part.replace("-", " "), href };
  });

  return (
    <nav className="text-sm text-slate-500 mb-4">
      {crumbs.map((c, i) => (
        <span key={c.href}>
          <Link href={c.href} className="hover:underline capitalize">
            {c.label}
          </Link>
          {i < crumbs.length - 1 && " / "}
        </span>
      ))}
    </nav>
  );
}
