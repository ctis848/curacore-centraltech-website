// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-white fixed top-0 left-0 right-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-black tracking-tight">
            CuraCore
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-yellow-300 font-medium">Home</Link>
            <Link href="/buy" className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition">
              Buy Now
            </Link>
            <Link href="/portal/dashboard" className="hover:text-yellow-300 font-medium">Dashboard</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-3xl"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`md:hidden transition-all duration-300 ${open ? 'block' : 'hidden'}`}>
          <div className="bg-blue-800 px-4 py-6 space-y-4 text-center">
            <Link href="/" className="block text-xl font-medium py-3 hover:bg-blue-700 rounded">Home</Link>
            <Link href="/buy" className="block bg-yellow-400 text-blue-900 py-4 rounded-full font-bold text-xl">Buy Now</Link>
            <Link href="/portal/dashboard" className="block text-xl font-medium py-3 hover:bg-blue-700 rounded">Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}