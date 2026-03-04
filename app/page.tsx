import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

export const metadata: Metadata = {
  title: "CentralCore EMR",
  description: "Central Tech Information Systems Ltd.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>

      <body className="min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900 antialiased pb-safe">
        <Navbar />
        <main className="flex-1 w-full max-w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

/* ---------------- NAVBAR ---------------- */

function Navbar() {
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

/* ---------------- FOOTER ---------------- */

function Footer() {
  return (
    <footer className="bg-teal-900 text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        <div>
          <h3 className="text-xl font-bold mb-3">CentralCore EMR</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            A complete electronic medical record system designed for modern hospitals.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Products</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/centralcore">CentralCore EMR</Link></li>
            <li><Link href="/nurse-call">Nurse Call System</Link></li>
            <li><Link href="/digital-signage">Digital Signage</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      <div className="text-center text-gray-400 text-sm mt-10">
        © {new Date().getFullYear()} Central Tech Information Systems Ltd.
      </div>
    </footer>
  );
}
