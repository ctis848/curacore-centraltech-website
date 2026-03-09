'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore EMR Services"
          fill
          priority
          className="object-cover object-center scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-xl tracking-tight">
            Professional Services for Your Hospital
          </h1>

          <p className="text-xl md:text-2xl font-light max-w-3xl drop-shadow-lg">
            From installation to training and ongoing support — CentralCore EMR ensures your hospital runs smoothly.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-16">
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 text-center">
          What We Offer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: "EMR Installation & Setup", desc: "Full deployment of CentralCore EMR across your hospital infrastructure with zero downtime.", icon: "⚙️" },
            { title: "Data Migration", desc: "Secure transfer of patient records, lab results, and historical data into CentralCore EMR.", icon: "📁" },
            { title: "Staff Training", desc: "Hands‑on training for doctors, nurses, pharmacists, and administrative staff.", icon: "🎓" },
            { title: "24/7 Technical Support", desc: "Round‑the‑clock assistance to ensure your hospital never experiences workflow interruptions.", icon: "🛠️" },
            { title: "Custom Integrations", desc: "Connect your EMR with lab machines, pharmacy systems, CCTV, nurse call systems, and more.", icon: "🔗" },
            { title: "System Maintenance", desc: "Regular updates, security patches, and performance optimization for smooth operation.", icon: "🔒" },
            { title: "Cloud Backup & Recovery", desc: "Automatic secure backups with fast recovery options to protect your hospital data.", icon: "☁️" },
            { title: "On‑Site Support", desc: "Our engineers can visit your hospital for installation, troubleshooting, or upgrades.", icon: "🏥" },
            { title: "Custom Feature Development", desc: "Need a unique workflow? We build custom modules tailored to your hospital.", icon: "🧩" }
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-teal-200"
            >
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="text-2xl font-bold text-teal-800 mb-3">{s.title}</h3>
              <p className="text-gray-700 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Let’s Transform Your Hospital Together
          </h2>

          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
            Our team is ready to deploy CentralCore EMR and support your hospital every step of the way.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
            >
              Buy License Now
            </Link>

            <Link
              href="/contact"
              className="bg-white text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              Contact Us
            </Link>

            {/* REQUEST QUOTE BUTTON */}
            <Link
              href="mailto:centralcore@yourdomain.com?subject=Request%20Quote&body=Hello%20CentralCore%20Team,%0D%0A%0D%0AI%20would%20like%20to%20request%20a%20quote%20for%20your%20services.%20Please%20contact%20me%20with%20more%20details.%0D%0A%0D%0AThank%20you."
              className="bg-teal-500 text-white px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-teal-400 hover:scale-105 transition-all duration-300"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
