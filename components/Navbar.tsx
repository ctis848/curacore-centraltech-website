'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <nav className="w-full border-b bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          CentralCore
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/">Home</Link>
          <Link href="/features">Features</Link>
          <Link href="/services">Services</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/products">Products</Link>
          <Link href="/buy" className="text-yellow-600 font-semibold">Buy</Link>

          {/* AUTH ROUTES */}
          <Link href="/auth/client/login" className="text-blue-600">
            Login
          </Link>

          <Link
            href="/auth/client/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-inner px-6 py-4 flex flex-col gap-4 font-medium">
          <Link href="/" onClick={toggleMenu}>Home</Link>
          <Link href="/features" onClick={toggleMenu}>Features</Link>
          <Link href="/services" onClick={toggleMenu}>Services</Link>
          <Link href="/resources" onClick={toggleMenu}>Resources</Link>
          <Link href="/pricing" onClick={toggleMenu}>Pricing</Link>
          <Link href="/products" onClick={toggleMenu}>Products</Link>
          <Link href="/buy" onClick={toggleMenu} className="text-yellow-600 font-semibold">
            Buy
          </Link>

          {/* AUTH ROUTES */}
          <Link
            href="/auth/client/login"
            onClick={toggleMenu}
            className="text-blue-600"
          >
            Login
          </Link>

          <Link
            href="/auth/client/signup"
            onClick={toggleMenu}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-center"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}