// components/Navbar.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-wider">
              Central Tech Information Systems
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-300 transition">Home</Link>
            <Link href="/products" className="hover:text-blue-300 transition">Products & Services</Link>
            <Link href="/curacore" className="hover:text-blue-300 transition">CuraCore EMR</Link>
            <Link href="/portal/login" className="bg-white text-blue-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition">
              Client Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-3xl"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu – slides in perfectly */}
      <div className={`md:hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-blue-800 px-4 pt-2 pb-4 space-y-1">
          <Link href="/" className="block py-3 text-lg hover:bg-blue-700 rounded">Home</Link>
          <Link href="/products" className="block py-3 text-lg hover:bg-blue-700 rounded">Products & Services</Link>
          <Link href="/curacore" className="block py-3 text-lg hover:bg-blue-700 rounded">CuraCore EMR</Link>
          <Link href="/portal/login" className="block py-3 text-lg bg-white text-blue-900 font-bold rounded text-center">Client Portal</Link>
        </div>
      </div>
    </nav>
  );
}