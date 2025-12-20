// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section - Teal Theme */}
      <section className="relative bg-gradient-to-br from-teal-600 to-teal-800 text-white py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              CuraCore EMR
            </h1>
            <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl mx-auto">
              A Complete Electronic Medical Record System for Modern Healthcare
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link
                href="/products"
                className="bg-white text-teal-700 px-12 py-6 rounded-full text-2xl font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Explore Features
              </Link>
              <Link
                href="/buy"
                className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-lg"
              >
                Buy License Now
              </Link>
            </div>
          </div>
        </div>

        {/* Overlapping Dashboard Mockups - Placeholder */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3 w-full max-w-6xl pointer-events-none">
          <div className="relative">
            <div className="absolute left-0 -bottom-20 w-96 md:w-[500px] shadow-2xl rounded-2xl overflow-hidden rotate-[-8deg] border-8 border-white">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-80 flex items-center justify-center text-gray-500">
                Dashboard Screenshot 1
              </div>
            </div>
            <div className="absolute left-1/3 bottom-0 w-96 md:w-[550px] shadow-2xl rounded-2xl overflow-hidden rotate-[-3deg] border-8 border-white z-10">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-72 md:h-96 flex items-center justify-center text-gray-500">
                Dashboard Screenshot 2
              </div>
            </div>
            <div className="absolute right-0 -bottom-10 w-96 md:w-[500px] shadow-2xl rounded-2xl overflow-hidden rotate-[6deg] border-8 border-white">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-80 flex items-center justify-center text-gray-500">
                Dashboard Screenshot 3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-teal-800 mb-8">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join thousands of hospitals and clinics transforming patient care with CuraCore EMR — secure, intuitive, and powerful.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 text-white py-20 px-6">
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