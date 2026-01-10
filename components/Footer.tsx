// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-950 text-white py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Company</h4>
            <ul className="space-y-3 text-teal-200">
              <li><Link href="/about" className="hover:text-yellow-400 transition">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-yellow-400 transition">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">CentralCore EMR</h4>
            <ul className="space-y-3 text-teal-200">
              <li><Link href="/products" className="hover:text-yellow-400 transition">Features</Link></li>
              <li><Link href="/buy" className="hover:text-yellow-400 transition">Pricing & License</Link></li>
              <li><Link href="/portal" className="hover:text-yellow-400 transition">Customer Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Resources</h4>
            <ul className="space-y-3 text-teal-200">
              <li><Link href="/support" className="hover:text-yellow-400 transition">Support</Link></li>
              <li><Link href="/documentation" className="hover:text-yellow-400 transition">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-yellow-400 transition">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Contact</h4>
            <p className="text-teal-200 leading-relaxed">
              Central Tech Information Systems Ltd.<br />
              Lagos, Nigeria<br />
              +234 805 931 8564<br />
              info@centraltechinformationsystems.com
            </p>
          </div>

          {/* Column 5: Trusted By */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Trusted By</h4>
            <ul className="space-y-3 text-teal-200 text-sm">
              <li>• Prime Medical Consultants</li>
              <li>• Ultimate Specialist Hospital</li>
              <li>• Althahus Medical Center</li>
              <li>• + Thousands Worldwide</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-teal-300">
          <div className="mb-4 md:mb-0">
            <p>© 2026 Central Tech Information Systems Ltd. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="hover:text-yellow-400">Facebook</Link>
            <Link href="#" className="hover:text-yellow-400">Twitter</Link>
            <Link href="#" className="hover:text-yellow-400">LinkedIn</Link>
            <Link href="#" className="hover:text-yellow-400">Instagram</Link>
            <Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-yellow-400">Terms of Service</Link>
            <Link href="/security" className="hover:text-yellow-400">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}