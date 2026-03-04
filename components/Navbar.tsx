"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 md:px-10">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-teal-800">
          CTIS
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 text-gray-700 font-medium">
          <Link href="/centralcore">CentralCore</Link>
          <Link href="/features">Features</Link>
          <Link href="/services">Services</Link>
          <Link href="/resources">Resources</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-3xl text-teal-800"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4 text-gray-700 font-medium">
          <Link href="/centralcore" onClick={() => setOpen(false)}>CentralCore</Link>
          <Link href="/features" onClick={() => setOpen(false)}>Features</Link>
          <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
          <Link href="/resources" onClick={() => setOpen(false)}>Resources</Link>
        </div>
      )}
    </nav>
  );
}
