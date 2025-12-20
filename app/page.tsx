// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Hero with Background Image */}
      <div className="relative h-screen w-full">
        <Image
          src="https://www.shutterstock.com/image-photo/doctor-working-emr-electronic-medical-260nw-360657371.jpg"  // High-quality doctor using EMR
          alt="Doctor using CuraCore EMR"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />  // Teal overlay for text readability

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Navbar already included in layout, but ensure teal */}

          {/* Hero Text */}
          <div className="text-center text-white pt-32 px-6">
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              CuraCore EMR
            </h1>
            <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl mx-auto">
              A Complete Electronic Medical Record System for Modern Healthcare
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link
                href="/buy"
                className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-lg"
              >
                Buy License Now
              </Link>
              <Link
                href="/products"
                className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-white/30 transition"
              >
                Explore Features
              </Link>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center text-white pb-20 px-6">
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
        </div>
      </div>

      {/* Trusted Section (below hero) */}
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
    </div>
  );
}