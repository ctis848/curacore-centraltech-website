"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Resources", href: "/resources" },
    { name: "Download", href: "/download" },
  ];

  return (
    <header className="bg-gray-950 text-gray-200 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white">
          CentralCore EMR
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-300 hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/auth/login"
            className="block text-gray-300 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="block text-teal-400 hover:text-teal-300"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
