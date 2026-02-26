// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    setOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/products' },
    { name: 'Services', href: '/services' },
    { name: 'Resources', href: '/resources' },
    { name: 'Download', href: '/download' },
    { name: 'Buy Now', href: '/buy', highlight: true },
  ];

  return (
    <nav className="bg-teal-700 text-white fixed top-0 left-0 right-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4">
            <Image
              src="/logo.png"
              alt="CentralCore EMR by CTIS Technologies"
              width={50}
              height={50}
              className="rounded-lg"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-black leading-none">CentralCore</span>
              <span className="text-xs text-teal-200 tracking-wider">
                by CTIS Technologies
              </span>
            </div>
            <span className="sm:hidden text-2xl font-black">CentralCore</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-teal-800 text-white'
                    : 'hover:text-yellow-200 hover:bg-teal-600/50'
                } ${
                  link.highlight
                    ? 'bg-yellow-400 text-teal-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 shadow-md'
                    : ''
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Login / Logout / Sign Up */}
            {user ? (
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-white transition"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 rounded-full font-bold text-teal-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"  // ← Add this page later if needed
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-full font-bold text-white transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-3xl focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-md"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-teal-800 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-4 px-6 text-lg font-medium rounded-xl text-center transition ${
                pathname === link.href
                  ? 'bg-teal-600 text-white'
                  : 'hover:bg-teal-600/70 text-white'
              } ${
                link.highlight
                  ? 'bg-yellow-400 text-teal-900 font-bold hover:bg-yellow-300'
                  : ''
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Login / Logout / Sign Up */}
          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full py-4 px-6 text-lg font-bold bg-red-600 hover:bg-red-700 rounded-xl text-white transition"
            >
              Logout
            </button>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full py-4 px-6 text-lg font-bold bg-yellow-400 hover:bg-yellow-300 rounded-xl text-teal-900 transition text-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full py-4 px-6 text-lg font-bold bg-teal-500 hover:bg-teal-600 rounded-xl text-white transition text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}