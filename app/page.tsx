// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            Welcome to Central Tech Information Systems
          </h1>
          <p className="text-2xl md:text-3xl mb-12 text-blue-100">
            Global Leader in Healthcare & Enterprise Technology Solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/products"
              className="bg-white text-blue-900 px-10 py-5 rounded-full text-2xl font-bold hover:bg-gray-100 transition"
            >
              Explore CuraCore EMR
            </Link>
            <Link
              href="/buy"
              className="bg-yellow-400 text-blue-900 px-10 py-5 rounded-full text-2xl font-bold hover:bg-yellow-300 transition"
            >
              Buy License Now
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 mb-8">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <p className="text-2xl text-gray-700">
            Join thousands of hospitals and clinics using CuraCore EMR to deliver better patient care.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-8">
            Ready to Transform Your Hospital?
          </h2>
          <Link
            href="/buy"
            className="bg-yellow-400 text-blue-900 px-12 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}