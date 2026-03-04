// app/documentation/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-screen w-full overflow-hidden">
        <Image
          src="/docs-hero.jpg"
          alt="CentralCore EMR user interface and documentation"
          fill
          priority
          className="object-cover object-center scale-110 sm:scale-105"
        />

        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-6 drop-shadow-2xl leading-tight">
            Documentation
          </h1>

          <p className="text-base sm:text-xl md:text-4xl font-light max-w-2xl sm:max-w-4xl drop-shadow-lg leading-relaxed">
            User Guides, Manuals & Training Resources
          </p>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-teal-900 leading-tight">
            Documentation Coming Soon
          </h2>

          <p className="text-base sm:text-lg md:text-2xl text-gray-700 leading-relaxed">
            Comprehensive guides for administrators, doctors, nurses, pharmacists, and lab technicians — including setup, daily workflows, troubleshooting, and advanced features.
          </p>

          <p className="text-sm sm:text-base md:text-xl text-gray-600 leading-relaxed">
            Video tutorials, PDF manuals, and a searchable knowledge base launching soon.
          </p>

          <Link
            href="/support"
            className="bg-yellow-400 text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Contact Support for Help Now
          </Link>
        </div>
      </section>
    </div>
  );
}
