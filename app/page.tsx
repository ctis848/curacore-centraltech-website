// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Hero with Futuristic Doctor EMR Background - Now Local */}
      <div className="relative h-screen w-full">
        <Image
          src="/image-2.jpg" // Local file in /public/image-2.jpg
          alt="Doctor using futuristic tablet interface for EHR/EMR and telemedicine"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" /> {/* Teal overlay for text readability */}

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            CuraCore EMR
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            A Complete Electronic Medical Record System for Modern Healthcare
          </p>
          <div className="flex flex-col sm:flex-row gap-8">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl"
            >
              Buy License Now
            </Link>
            <Link
              href="/products"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-white/30 transition shadow-2xl"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Trusted Section */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-teal-800 mb-8">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join thousands of hospitals and clinics transforming patient care with CuraCore EMR — secure, intuitive, and powerful.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 bg-teal-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Ready to Modernize Your Practice?
          </h2>
          <Link
            href="/buy"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 inline-block shadow-2xl transition"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Modern HubSpot-Style Footer */}
      <footer className="bg-teal-950 text-white py-16">
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

            {/* Column 2: Products */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-yellow-400">Products</h4>
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

            {/* Column 4: Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-yellow-400">Contact</h4>
              <p className="text-teal-200 leading-relaxed">
                Central Tech Information Systems Ltd.<br />
                Port Harcourt, Nigeria<br />
                +234 805 931 8564<br />
                info@curacore.com
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

          {/* Bottom Bar: Social + Legal */}
          <div className="border-t border-teal-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-teal-300">
            <div className="mb-4 md:mb-0">
              <p>© 2025 Central Tech Information Systems Ltd. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              {/* Replace # with real links when ready */}
              <Link href="#" className="hover:text-yellow-400">Facebook</Link>
              <Link href="#" className="hover:text-yellow-400">Twitter</Link>
              <Link href="#" className="hover:text-yellow-400">LinkedIn</Link>
              <Link href="#" className="hover:text-yellow-400">Instagram</Link>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-yellow-400">Terms of Service</Link>
              <Link href="/security" className="hover:text-yellow-400">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}