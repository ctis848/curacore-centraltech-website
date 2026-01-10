// app/documentation/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function DocumentationPage() {
  return (
    <>
      {/* Hero with EMR Screenshot Background */}
      <section className="relative h-screen w-full">
        <Image
          src="/docs-hero.jpg"
          alt="CentralCore EMR user interface and documentation"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Documentation
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            User Guides, Manuals & Training Resources
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-teal-900 mb-12">
            Documentation Coming Soon
          </h2>
          <p className="text-2xl text-gray-700 mb-16 leading-relaxed">
            Comprehensive guides for administrators, doctors, nurses, pharmacists, and lab technicians — including setup, daily workflows, troubleshooting, and advanced features.
          </p>
          <p className="text-xl text-gray-600 mb-20">
            Video tutorials, PDF manuals, and searchable knowledge base launching soon.
          </p>
          <Link
            href="/support"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Contact Support for Help Now
          </Link>
        </div>
      </section>
    </>
  );
}