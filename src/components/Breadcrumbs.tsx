'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  const crumbs = parts.map((part, index) => {
    const href = '/' + parts.slice(0, index + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1);
    return { href, label };
  });

  return (
    <nav className="text-sm text-gray-600 dark:text-gray-300 mb-6">
      {crumbs.map((c, i) => (
        <span key={i}>
          <Link href={c.href} className="hover:underline">
            {c.label}
          </Link>
          {i < crumbs.length - 1 && ' / '}
        </span>
      ))}
    </nav>
  );
}
