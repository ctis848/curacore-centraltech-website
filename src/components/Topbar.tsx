'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();

  const navLink = (path: string) =>
    `px-4 py-2 rounded-lg transition font-medium ${
      pathname === path
        ? 'text-teal-700 font-semibold'
        : 'text-gray-700 hover:text-teal-700'
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-teal-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">

        {/* Logo */}
        <Link href="/" className="text-2xl font-black text-teal-800 tracking-tight">
          CentralCore
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={navLink('/')}>Home</Link>
          <Link href="/features" className={navLink('/features')}>Features</Link>
          <Link href="/services" className={navLink('/services')}>Services</Link>
          <Link href="/resources" className={navLink('/resources')}>Resources</Link>
          <Link href="/download" className={navLink('/download')}>Download</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/buy"
            className="hidden sm:block bg-yellow-400 text-teal-900 px-5 py-2 rounded-xl font-semibold shadow hover:bg-yellow-300 transition"
          >
            Buy Now
          </Link>

          <Link
            href="/login"
            className="text-teal-700 font-medium hover:text-teal-900 transition"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-teal-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-teal-800 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
