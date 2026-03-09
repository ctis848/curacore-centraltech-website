'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface NavbarClientProps {
  user: any | null; // allow null to avoid TS errors
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent"
            >
              CentralCore
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10 ml-12">
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/resources">Resources</NavLink>
            <NavLink href="/download">Download</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <BuyNowButton />
            {user ? (
              <LogoutButton />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl text-gray-700 dark:text-gray-300 focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          <div className="px-4 py-6 space-y-5">
            <div className="flex flex-col space-y-4">
              <MobileNavLink href="/features">Features</MobileNavLink>
              <MobileNavLink href="/services">Services</MobileNavLink>
              <MobileNavLink href="/resources">Resources</MobileNavLink>
              <MobileNavLink href="/download">Download</MobileNavLink>
              <MobileNavLink href="/pricing">Pricing</MobileNavLink>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <BuyNowButton mobile />

              {user ? (
                <div className="mt-4">
                  <LogoutButton />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block text-center py-3 text-gray-700 dark:text-gray-300 font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block text-center py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* Desktop Nav Link */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

/* Mobile Nav Link */
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
    >
      {children}
    </Link>
  );
}

/* Buy Now Button */
function BuyNowButton({ mobile = false }: { mobile?: boolean }) {
  const className = mobile
    ? "block w-full text-center py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
    : "bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md";

  return (
    <Link href="/pricing" className={className}>
      Buy Now
    </Link>
  );
}
