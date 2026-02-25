'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/products' },
    { name: 'Services', href: '/services' },
    { name: 'Resources', href: '/resources' },
    { name: 'Download', href: '/download' },
    { name: 'Buy Now', href: '/buy', highlight: true },
    { name: 'Dashboard', href: '/dashboard' }, // FIXED: removed /portal
  ];

  return (
    <nav className="bg-teal-700 text-white fixed top-0 left-0 right-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4">
            <Image
              src="/logo.png"
              alt="CentralCore EMR by CTIS Technologies"
              width={50}
              height={50}
              className="rounded-lg"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-black leading-none">CentralCore</span>
              <span className="text-xs text-teal-200 tracking-wider">
                by CTIS Technologies
              </span>
            </div>
            <span className="sm:hidden text-2xl font-black">CentralCore</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-teal-800 text-white'
                    : 'hover:text-yellow-200 hover:bg-teal-600/50'
                } ${
                  link.highlight
                    ? 'bg-yellow-400 text-teal-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 shadow-md'
                    : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-3xl focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-md"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-teal-800 px-4 py-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-4 px-6 text-lg font-medium rounded-xl text-center transition ${
                pathname === link.href
                  ? 'bg-teal-600 text-white'
                  : 'hover:bg-teal-600/70 text-white'
              } ${
                link.highlight
                  ? 'bg-yellow-400 text-teal-900 font-bold hover:bg-yellow-300'
                  : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}