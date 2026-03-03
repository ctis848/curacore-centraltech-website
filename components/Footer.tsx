'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 bg-white/80 backdrop-blur-md border-t border-teal-100">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Company */}
        <div>
          <h3 className="text-xl font-bold text-teal-800 mb-4">Company</h3>
          <ul className="space-y-2 text-gray-700">
            <li><Link href="/about" className="hover:text-teal-700 transition">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-teal-700 transition">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-teal-700 transition">Contact</Link></li>
          </ul>
        </div>

        {/* CentralCore EMR */}
        <div>
          <h3 className="text-xl font-bold text-teal-800 mb-4">CentralCore EMR</h3>
          <ul className="space-y-2 text-gray-700">
            <li><Link href="/features" className="hover:text-teal-700 transition">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-teal-700 transition">Pricing & License</Link></li>
            <li><Link href="/download" className="hover:text-teal-700 transition">Download App</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-bold text-teal-800 mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-700">
            <li><Link href="/support" className="hover:text-teal-700 transition">Support</Link></li>
            <li><Link href="/docs" className="hover:text-teal-700 transition">Documentation</Link></li>
            <li><Link href="/faq" className="hover:text-teal-700 transition">FAQ</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold text-teal-800 mb-4">Contact</h3>
          <p className="text-gray-700 leading-relaxed">
            Central Tech Information Systems Ltd.<br />
            Lagos, Nigeria<br />
            <span className="block mt-2">Email: info@ctistech.com</span>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-teal-100 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} CentralCore EMR. All rights reserved.</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-teal-700 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-teal-700 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
