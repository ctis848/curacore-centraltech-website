'use client';

import Image from 'next/image';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore EMR Features"
          fill
          priority
          className="object-cover object-center scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-xl tracking-tight">
            Powerful Features for Modern Healthcare
          </h1>

          <p className="text-xl md:text-2xl font-light max-w-3xl drop-shadow-lg">
            CentralCore EMR brings together every tool your hospital needs — fast, secure, and beautifully integrated.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-16">
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 text-center">
          Everything Your Hospital Needs in One System
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Feature Cards */}
          {[
            {
              title: "Electronic Medical Records",
              desc: "Complete patient histories, vitals, diagnoses, and clinical notes — all in one secure place.",
              icon: "🩺"
            },
            {
              title: "Pharmacy Management",
              desc: "Track prescriptions, manage stock, automate dispensing, and prevent medication errors.",
              icon: "💊"
            },
            {
              title: "Laboratory Integration",
              desc: "Automated lab result processing with real-time updates directly into patient charts.",
              icon: "🧪"
            },
            {
              title: "Radiology & Imaging",
              desc: "Upload, view, and manage X-rays, CT scans, and MRIs with seamless EMR integration.",
              icon: "🖼️"
            },
            {
              title: "Billing & Finance",
              desc: "Automated invoicing, payment tracking, insurance claims, and financial reporting.",
              icon: "💳"
            },
            {
              title: "Hospital Surveillance",
              desc: "CCTV monitoring integrated into your dashboard for improved security and oversight.",
              icon: "📹"
            },
            {
              title: "Nurse Call System",
              desc: "Instant alerts from patients to nurses for faster response and improved care.",
              icon: "🔔"
            },
            {
              title: "Digital Signage",
              desc: "Display patient queues, announcements, and hospital updates in real time.",
              icon: "🖥️"
            },
            {
              title: "Machine Licensing",
              desc: "Register, activate, and manage all hospital devices with secure license control.",
              icon: "🔐"
            }
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-teal-200"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-2xl font-bold text-teal-800 mb-3">{f.title}</h3>
              <p className="text-gray-700 leading-relaxed">{f.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Experience the Future of Healthcare
          </h2>

          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
            CentralCore EMR is built to help hospitals deliver faster, safer, and smarter patient care.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
            >
              Buy License Now
            </a>

            <a
              href="/download"
              className="bg-white text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              Download App
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
