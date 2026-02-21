// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-950 text-white py-16 mt-auto border-t border-teal-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 mb-12">
          {/* Column 1: Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Company</h4>
            <nav>
              <ul className="space-y-3 text-teal-200">
                <li>
                  <Link href="/about" className="hover:text-yellow-400 transition-colors duration-200">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-yellow-400 transition-colors duration-200">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-yellow-400 transition-colors duration-200">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 2: CentralCore EMR */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">CentralCore EMR</h4>
            <nav>
              <ul className="space-y-3 text-teal-200">
                <li>
                  <Link href="/products" className="hover:text-yellow-400 transition-colors duration-200">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/buy" className="hover:text-yellow-400 transition-colors duration-200">
                    Pricing & License
                  </Link>
                </li>
                <li>
                  <Link href="/portal/login" className="hover:text-yellow-400 transition-colors duration-200">
                    Customer Portal
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Resources</h4>
            <nav>
              <ul className="space-y-3 text-teal-200">
                <li>
                  <Link href="/support" className="hover:text-yellow-400 transition-colors duration-200">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="hover:text-yellow-400 transition-colors duration-200">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-yellow-400 transition-colors duration-200">
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-yellow-400">Contact</h4>
            <address className="text-teal-200 leading-relaxed not-italic">
              Central Tech Information Systems Ltd.<br />
              Lagos, Nigeria<br />
              <a 
                href="tel:+2348059318564" 
                className="hover:text-yellow-400 transition-colors duration-200"
              >
                +234 805 931 8564
              </a><br />
              <a 
                href="mailto:info@ctistech.com" 
                className="hover:text-yellow-400 transition-colors duration-200 block mt-2"
              >
                info@ctistech.com
              </a>
              <a 
                href="mailto:support@ctistech.com" 
                className="hover:text-yellow-400 transition-colors duration-200 block mt-1"
              >
                support@ctistech.com
              </a>
            </address>
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
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p>© 2026 Central Tech Information Systems Ltd. All rights reserved.</p>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-6">
            <Link href="#" className="hover:text-yellow-400 transition-colors duration-200">
              Facebook
            </Link>
            <Link href="#" className="hover:text-yellow-400 transition-colors duration-200">
              Twitter
            </Link>
            <Link href="#" className="hover:text-yellow-400 transition-colors duration-200">
              LinkedIn
            </Link>
            <Link href="#" className="hover:text-yellow-400 transition-colors duration-200">
              Instagram
            </Link>
            <Link href="/privacy" className="hover:text-yellow-400 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-yellow-400 transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-yellow-400 transition-colors duration-200">
              Security
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}