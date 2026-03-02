'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="Modern hospital background for CentralCore EMR"
          fill
          priority
          className="object-cover object-center scale-105 animate-[heroZoom_12s_ease-in-out_infinite]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-xl tracking-tight">
            CentralCore EMR
          </h1>

          <p className="text-2xl md:text-4xl mb-10 font-light max-w-4xl drop-shadow-lg leading-snug">
            A Complete Electronic Medical Record System for Modern Healthcare
          </p>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
            >
              Buy License Now
            </Link>

            <Link
              href="/products"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white/40 px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-xl hover:bg-white/30 hover:scale-105 transition-all duration-300"
            >
              Explore Features
            </Link>

            <Link
              href="/download"
              className="bg-teal-500 text-white px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-xl hover:bg-teal-600 hover:scale-105 transition-all duration-300"
            >
              Download App
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES PREVIEW */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 text-center">
          Why Hospitals Choose CentralCore EMR
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              title: "Smart Patient Records",
              desc: "Access complete patient histories, vitals, and clinical notes instantly.",
              icon: "🩺"
            },
            {
              title: "Integrated Pharmacy",
              desc: "Manage prescriptions, stock levels, and dispensing with ease.",
              icon: "💊"
            },
            {
              title: "Laboratory Automation",
              desc: "Fast, accurate lab result processing with seamless EMR integration.",
              icon: "🧪"
            },
            {
              title: "Hospital Surveillance",
              desc: "CCTV monitoring integrated directly into your hospital dashboard.",
              icon: "📹"
            },
            {
              title: "Nurse Call System",
              desc: "Instant patient-to-nurse communication for faster response times.",
              icon: "🔔"
            },
            {
              title: "Digital Signage",
              desc: "Display patient queues, announcements, and hospital updates.",
              icon: "🖥️"
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

      {/* CTA SECTION */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Ready to Modernize Your Hospital?
          </h2>

          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
            CentralCore EMR gives you the tools to deliver faster, safer, and smarter patient care.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
            >
              Buy License Now
            </Link>

            <Link
              href="/download"
              className="bg-white text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              Download App
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
