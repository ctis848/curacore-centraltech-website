// app/careers/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function CareersPage() {
  return (
    <>
      {/* Hero with Team Background */}
      <section className="relative h-screen w-full">
        <Image
          src="/careers-hero.jpg"  // Local file in /public/careers-hero.jpg
          alt="Diverse African healthcare IT team working together"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Join Our Team
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            Build the Future of Healthcare IT in Africa
          </p>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-teal-900 mb-12">
            Careers at Central Tech
          </h2>
          <p className="text-2xl text-gray-700 mb-16 leading-relaxed">
            We're growing fast and looking for passionate developers, healthcare IT specialists, support engineers, and sales professionals to join our mission of transforming African healthcare through technology.
          </p>
          <p className="text-xl text-gray-600 mb-20">
            Job openings coming soon — exciting roles in software development, implementation, training, and customer success.
          </p>
          <Link
            href="/contact"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Send Your CV
          </Link>
        </div>
      </section>
    </>
  );
}