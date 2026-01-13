// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-950 text-white py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Company */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">Company</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li><Link href="/about" className="hover:text-yellow-400">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-yellow-400">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">CentralCore EMR</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li><Link href="/products" className="hover:text-yellow-400">Features</Link></li>
              <li><Link href="/buy" className="hover:text-yellow-400">Pricing & License</Link></li>
              <li><Link href="/portal/login" className="hover:text-yellow-400">Customer Portal</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">Resources</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li><Link href="/support" className="hover:text-yellow-400">Support</Link></li>
              <li><Link href="/documentation" className="hover:text-yellow-400">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-yellow-400">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">Contact</h4>
            <p className="text-teal-200 text-sm leading-relaxed">
              Central Tech Information Systems Ltd.<br />
              Lagos, Nigeria<br />
              +234 805 931 8564<br />
              <a href="mailto:info@centraltechinformationsystems.com" className="hover:text-yellow-400">
                info@centraltechinformationsystems.com
              </a>
            </p>
          </div>

          {/* Trusted By */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">Trusted By</h4>
            <ul className="space-y-2 text-teal-200 text-sm">
              <li>Prime Medical Consultants</li>
              <li>Ultimate Specialist Hospital</li>
              <li>Althahus Medical Center</li>
              <li>Thousands Worldwide</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-teal-300">
          <p className="mb-4 md:mb-0">© 2026 Central Tech Information Systems Ltd. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-yellow-400">Facebook</Link>
            <Link href="#" className="hover:text-yellow-400">Twitter</Link>
            <Link href="#" className="hover:text-yellow-400">LinkedIn</Link>
            <Link href="#" className="hover:text-yellow-400">Instagram</Link>
            <Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-yellow-400">Terms</Link>
            <Link href="/security" className="hover:text-yellow-400">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}