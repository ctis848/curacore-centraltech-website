"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function NavbarClient({ user }: { user: any }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (path: string) =>
    pathname === path
      ? "text-yellow-400 font-semibold"
      : scrolled
      ? "text-gray-700 hover:text-gray-900"
      : "text-gray-200 hover:text-white";

  const handleLogout = () => {
    console.warn("Logout action not implemented yet");
    window.location.href = "/login";
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md text-gray-900" : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-bold ${
            scrolled ? "text-gray-900" : "text-white"
          }`}
        >
          CentralCore
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <Link href="/features" className={linkClass("/features")}>Features</Link>
          <Link href="/services" className={linkClass("/services")}>Services</Link>
          <Link href="/resources" className={linkClass("/resources")}>Resources</Link>
          <Link href="/pricing" className={linkClass("/pricing")}>Pricing</Link>
          <Link href="/download" className={linkClass("/download")}>Download</Link>
        </div>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/buy"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md"
          >
            Buy Now
          </Link>

          {!user && (
            <>
              {/* FIXED CLIENT PORTAL LOGIN */}
              <Link
                href="/auth/client/login"
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-semibold ml-2"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white text-gray-900 shadow-lg px-6 py-4 space-y-4">
          <Link href="/features" className="block">Features</Link>
          <Link href="/services" className="block">Services</Link>
          <Link href="/resources" className="block">Resources</Link>
          <Link href="/pricing" className="block">Pricing</Link>
          <Link href="/download" className="block">Download</Link>

          <hr />

          <Link
            href="/buy"
            className="block bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold"
          >
            Buy Now
          </Link>

          {!user && (
            <>
              {/* FIXED CLIENT PORTAL LOGIN (MOBILE) */}
              <Link
                href="/auth/client/login"
                className="block"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="block bg-green-600 text-white px-4 py-2 rounded-md font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                href="/dashboard"
                className="block bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="block text-red-600 font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
