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

      <footer className="bg-[#0f1a2b] text-gray-300 pt-20 pb-10 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">

          {/* 4‑Column Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Column 1: About + CTA */}
            <div>
              <h3 className="text-2xl font-bold text-white leading-snug">
                Empowering Modern Healthcare
              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">
                CentralCore EMR delivers secure, intelligent, and scalable medical
                record management for clinics, hospitals, and enterprise health networks.
              </p>

              <a
                href="/contact"
                className="inline-block mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-500 
                           text-white rounded-lg font-semibold transition"
              >
                Contact Sales
              </a>
            </div>

            {/* Column 2: Product */}
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

            {/* Column 3: Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white">Contact</h3>
              <ul className="mt-4 space-y-2">
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
                <li>
                  <a
                    href="https://wa.me/2349120523832"
                    target="_blank"
                    className="hover:text-white transition"
                  >
                    WhatsApp Support
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li className="text-gray-400">Lagos, Nigeria</li>
              </ul>
            </div>

            {/* Column 4: Compliance */}
            <div>
              <h3 className="text-lg font-semibold text-white">Compliance</h3>
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
