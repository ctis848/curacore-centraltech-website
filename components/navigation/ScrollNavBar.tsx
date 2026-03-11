"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ScrollNavBar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSolid(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all ${
        solid ? "bg-teal-800 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-2xl font-black text-white">
          CTIS
        </Link>

        <div className="flex gap-6 text-white">
          <Link href="/features">Features</Link>
          <Link href="/services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Download</Link>
        </div>
      </div>
    </nav>
  );
}
