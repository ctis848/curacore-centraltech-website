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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-teal-700 text-white shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* NAVBAR INNER */}
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4">
            <Image
              src="/logo.png"
              alt="CentralCore EMR by CTIS Technologies"
              width={45}
              height={45}
              className="rounded-lg"
              priority
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xl font-black">CentralCore</span>
              <span className="text-[10px] text-teal-200 tracking-widest">
                by CTIS Technologies
              </span>
            </div>
            <span className="sm:hidden text-xl font-black">CentralCore</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-teal-800 text-white shadow-sm'
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

            {/* AUTH BUTTONS */}
            {user ? (
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-white transition-all duration-200 shadow-md"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 rounded-full font-bold text-teal-900 transition-all duration-200 shadow-md"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-full font-bold text-white transition-all duration-200 shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-3xl focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-md transition"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-teal-800 px-4 py-6 space-y-4">

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-4 px-6 text-lg font-medium rounded-xl text-center transition-all duration-200 ${
                pathname === link.href
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'hover:bg-teal-600/70 text-white'
              } ${
                link.highlight
                  ? 'bg-yellow-400 text-teal-900 font-bold hover:bg-yellow-300 shadow-md'
                  : ''
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* MOBILE AUTH */}
          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full py-4 px-6 text-lg font-bold bg-red-600 hover:bg-red-700 rounded-xl text-white transition-all duration-200 shadow-md"
            >
              Logout
            </button>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full py-4 px-6 text-lg font-bold bg-yellow-400 hover:bg-yellow-300 rounded-xl text-teal-900 transition-all duration-200 shadow-md text-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block w-full py-4 px-6 text-lg font-bold bg-teal-500 hover:bg-teal-600 rounded-xl text-white transition-all duration-200 shadow-md text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
