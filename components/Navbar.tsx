// components/Navbar.tsx
'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold">CuraCore</Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/buy" className="hover:text-yellow-300">Buy Now</Link>
            <Link href="/portal/dashboard" className="hover:text-yellow-300">Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}