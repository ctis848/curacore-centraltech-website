// app/careers/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-screen w-full overflow-hidden">
        <Image
          src="/careers-hero.jpg"
          alt="Diverse African healthcare IT team working together"
          fill
          priority
          className="object-cover object-center scale-110 sm:scale-105"
        />

        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-6 drop-shadow-2xl leading-tight">
            Join Our Team
          </h1>

          <p className="text-base sm:text-xl md:text-4xl font-light max-w-2xl sm:max-w-4xl drop-shadow-lg leading-relaxed">
            Build the Future of Healthcare IT in Africa
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-teal-900 leading-tight">
            Careers at Central Tech
          </h2>

          <p className="text-base sm:text-lg md:text-2xl text-gray-700 leading-relaxed">
            We're growing fast and looking for passionate developers, healthcare IT specialists, support engineers, and sales professionals to join our mission of transforming African healthcare through technology.
          </p>

          <p className="text-sm sm:text-base md:text-xl text-gray-600 leading-relaxed">
            Job openings coming soon — exciting roles in software development, implementation, training, and customer success.
          </p>

          <Link
            href="/contact"
            className="bg-yellow-400 text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Send Your CV
          </Link>
        </div>
      </section>
    </div>
  );
}
