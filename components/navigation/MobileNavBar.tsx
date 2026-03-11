"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `block px-4 py-2 font-semibold ${
      pathname === href ? "text-teal-300" : "text-white"
    }`;

  return (
    <nav className="bg-teal-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-2xl font-black">
          CTIS
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="text-white text-3xl md:hidden"
        >
          ☰
        </button>

        <div className="hidden md:flex gap-6">
          <Link href="/features" className={linkClass("/features")}>Features</Link>
          <Link href="/services" className={linkClass("/services")}>Services</Link>
          <Link href="/pricing" className={linkClass("/pricing")}>Pricing</Link>
          <Link href="/download" className={linkClass("/download")}>Download</Link>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-teal-900 px-6 pb-4">
          <Link href="/features" className={linkClass("/features")}>Features</Link>
          <Link href="/services" className={linkClass("/services")}>Services</Link>
          <Link href="/pricing" className={linkClass("/pricing")}>Pricing</Link>
          <Link href="/download" className={linkClass("/download")}>Download</Link>
        </div>
      )}
    </nav>
  );
}
