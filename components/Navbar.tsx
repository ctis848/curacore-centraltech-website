// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/products' },          // Changed "Products" → "Features" for clarity
    { name: 'Services', href: '/services' },
    { name: 'Resources', href: '/resources' },
    { name: 'Buy Now', href: '/buy', highlight: true },
    { name: 'Dashboard', href: '/portal/dashboard' },
  ];

  return (
    <nav className="bg-teal-700 text-white fixed top-0 left-0 right-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Updated to CentralCore EMR */}
          <Link href="/" className="text-2xl md:text-3xl font-black tracking-tight">
            CentralCore
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm lg:text-base font-medium transition ${
                  link.highlight
                    ? 'bg-yellow-400 text-teal-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-300'
                    : 'hover:text-yellow-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-3xl focus:outline-none"
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-teal-600 px-4 py-6 space-y-4 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-4 text-lg font-medium rounded-lg transition ${
                  link.highlight
                    ? 'bg-yellow-400 text-teal-900 font-bold text-xl'
                    : 'hover:bg-teal-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}