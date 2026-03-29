export default function Footer() {
  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "CentralCore EMR",
            url: "https://www.ctistech.com",
            logo: "https://www.ctistech.com/logo.png",
            contactPoint: [
              {
                "@type": "ContactPoint",
                email: "info@ctistech.com",
                contactType: "sales",
              },
              {
                "@type": "ContactPoint",
                email: "support@ctistech.com",
                contactType: "customer support",
              },
            ],
            sameAs: [
              "https://twitter.com/ctistech",
              "https://linkedin.com/company/ctistech",
              "https://facebook.com/ctistech",
              "https://instagram.com/ctistech",
            ],
          }),
        }}
      />

      <footer className="bg-gray-950 text-gray-300 pt-16 pb-10 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">

          {/* Top CTA */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              Empowering Modern Healthcare
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              CentralCore EMR delivers secure, intelligent, and scalable medical record
              management for clinics, hospitals, and enterprise health networks.
            </p>
            <a
              href="/contact"
              className="inline-block mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition"
            >
              Contact Sales
            </a>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Brand */}
            <div>
              <h2 className="text-2xl font-bold text-white">CentralCore EMR</h2>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Enterprise‑grade electronic medical record software designed for
                performance, security, and seamless clinical workflows.
              </p>

              {/* Social Icons */}
              <div className="flex gap-4 mt-6 text-xl">
                <a href="https://www.ctistech.com" target="_blank" className="hover:text-white transition">🌐</a>
                <a href="https://twitter.com/ctistech" target="_blank" className="hover:text-white transition">🐦</a>
                <a href="https://linkedin.com/company/ctistech" target="_blank" className="hover:text-white transition">💼</a>
                <a href="https://facebook.com/ctistech" target="_blank" className="hover:text-white transition">📘</a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/features" className="hover:text-white transition">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/download" className="hover:text-white transition">Download</a></li>
                <li><a href="/roadmap" className="hover:text-white transition">Roadmap</a></li>
                <li><a href="/updates" className="hover:text-white transition">Release Notes</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/docs" className="hover:text-white transition">Documentation</a></li>
                <li><a href="/api" className="hover:text-white transition">API Reference</a></li>
                <li><a href="/support" className="hover:text-white transition">Support Center</a></li>
                <li><a href="/support/ticket" className="hover:text-white transition">Submit Support Ticket</a></li>
                <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white">Contact</h3>
              <ul className="mt-4 space-y-2">

                {/* Emails */}
                <li>
                  <a href="mailto:info@ctistech.com" className="hover:text-white transition">
                    info@ctistech.com
                  </a>
                </li>
                <li>
                  <a href="mailto:support@ctistech.com" className="hover:text-white transition">
                    support@ctistech.com
                  </a>
                </li>

                {/* WhatsApp */}
                <li>
                  <a
                    href="https://wa.me/2349120523832"
                    target="_blank"
                    className="hover:text-white transition"
                  >
                    WhatsApp Support
                  </a>
                </li>

                {/* Contact Page */}
                <li>
                  <a href="/contact" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>

                {/* Location */}
                <li className="text-gray-400">Lagos, Nigeria</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-6">Compliance</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom */}
          <div className="text-center text-gray-500 mt-16 border-t border-gray-800 pt-6">
            © {new Date().getFullYear()} CentralCore EMR — All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
