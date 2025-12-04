// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const testimonials = [
    { name: "Prime Medical Consultants, Port Harcourt", text: "CuraCore transformed our workflow. Best EMR we've ever used!" },
    { name: "Ultimate Specialist Hospital, Port Harcourt", text: "Billing accuracy improved 100%. Highly recommended!" },
    { name: "Althahus Medical Center, Port Harcourt", text: "Offline capability saved us during network issues. Excellent support!" },
  ];

  return (
    <footer className="bg-blue-900 text-white py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">CuraCore EMR</h3>
            <p className="text-blue-200">
              Central Tech Information Systems Ltd.<br />
              Port Harcourt, Nigeria<br />
              +234 805 931 8564
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-blue-200">
              <li><Link href="/buy" className="hover:text-yellow-300">Buy License</Link></li>
              <li><Link href="/portal/dashboard" className="hover:text-yellow-300">Customer Portal</Link></li>
              <li><Link href="/support" className="hover:text-yellow-300">Support</Link></li>
            </ul>
          </div>

          {/* Testimonials */}
          <div>
            <h3 className="text-xl font-bold mb-4">Trusted By</h3>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-blue-800 p-4 rounded-lg">
                  <p className="text-sm italic">"{t.text}"</p>
                  <p className="text-yellow-300 font-semibold mt-2">- {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12 pt-8 border-t border-blue-700 text-blue-300">
          © 2025 Central Tech Information Systems Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}