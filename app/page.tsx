// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Hero with Doctor EMR Background - Image 2 */}
      <div className="relative h-screen w-full">
        <Image
          src="https://www.shutterstock.com/image-photo/doctor-working-on-laptop-tablet-260nw-2689078631.jpg"  // Image 2 - Clean doctor using EMR laptop/tablet
          alt="Doctor using CuraCore EMR system"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" /> {/* Teal overlay for text readability */}

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            CuraCore EMR
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            A Complete Electronic Medical Record System for Modern Healthcare
          </p>
          <div className="flex flex-col sm:flex-row gap-8">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl"
            >
              Buy License Now
            </Link>
            <Link
              href="/products"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-white/30 transition shadow-2xl"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Trusted Section */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-teal-800 mb-8">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join thousands of hospitals and clinics transforming patient care with CuraCore EMR — secure, intuitive, and powerful.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 bg-teal-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Ready to Modernize Your Practice?
          </h2>
          <Link
            href="/buy"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 inline-block shadow-2xl transition"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}