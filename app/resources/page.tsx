'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore EMR Resources"
          fill
          priority
          className="object-cover object-center scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-xl tracking-tight">
            Resources & Documentation
          </h1>

          <p className="text-xl md:text-2xl font-light max-w-3xl drop-shadow-lg">
            Everything you need to learn, deploy, and master CentralCore EMR.
          </p>
        </div>
      </section>

      {/* RESOURCES GRID */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-16">
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 text-center">
          Explore Our Resource Library
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {[
            {
              title: "User Documentation",
              desc: "Step‑by‑step guides for doctors, nurses, pharmacists, and administrators.",
              icon: "📘",
              link: "/docs"
            },
            {
              title: "Installation Guide",
              desc: "Everything you need to install and configure CentralCore EMR.",
              icon: "⚙️",
              link: "/docs/installation"
            },
            {
              title: "API Reference",
              desc: "Integrate CentralCore EMR with third‑party systems and hospital devices.",
              icon: "🧩",
              link: "/docs/api"
            },
            {
              title: "Video Tutorials",
              desc: "Learn how to use CentralCore EMR with easy‑to‑follow video lessons.",
              icon: "🎥",
              link: "/resources/videos"
            },
            {
              title: "Support Center",
              desc: "Get help, open tickets, and chat with our support team.",
              icon: "🛠️",
              link: "/support"
            },
            {
              title: "Release Notes",
              desc: "See what's new in the latest CentralCore EMR updates.",
              icon: "📝",
              link: "/resources/releases"
            }
          ].map((r, i) => (
            <Link
              key={i}
              href={r.link}
              className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-teal-200 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <div className="text-5xl mb-4">{r.icon}</div>
              <h3 className="text-2xl font-bold text-teal-800 mb-3">{r.title}</h3>
              <p className="text-gray-700 leading-relaxed">{r.desc}</p>
            </Link>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">
            Need Help Getting Started?
          </h2>

          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
            Our support team is ready to assist you with installation, training, and troubleshooting.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/support"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
            >
              Visit Support Center
            </Link>

            <Link
              href="/contact"
              className="bg-white text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
