"use client";

import Link from "next/link";

export default function StickyNavBar() {
  return (
    <nav className="bg-teal-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-2xl font-black">CTIS</Link>

        <div className="flex gap-6">
          <Link href="/features">Features</Link>
          <Link href="/services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Download</Link>
        </div>
      </div>
    </nav>
  );
}
