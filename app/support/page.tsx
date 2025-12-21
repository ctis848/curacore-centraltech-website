// app/support/page.tsx
import Link from 'next/link';

export default function SupportPage() {
  return (
    <>
      <section className="py-32 px-6 bg-teal-50">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black text-teal-900 mb-10 drop-shadow-lg">
            CuraCore Support Center
          </h1>
          <p className="text-3xl text-teal-800 mb-16 max-w-4xl mx-auto">
            We're here to help you get the most out of CuraCore EMR — 24/7 expert assistance
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            {/* Email Support */}
            <div className="bg-teal-50 rounded-3xl p-12 text-center border border-teal-200 shadow-xl">
              <div className="text-8xl mb-8">✉️</div>
              <h2 className="text-4xl font-black text-teal-900 mb-6">
                Email Support
              </h2>
              <p className="text-xl text-gray-700 mb-10 leading-relaxed">
                Get detailed help from our expert team — response within 4 hours
              </p>
              <a
                href="mailto:support@curacore.com"
                className="inline-block bg-teal-800 text-white px-16 py-6 rounded-full text-2xl font-bold hover:bg-teal-700 transition shadow-2xl"
              >
                Email Us Now
              </a>
            </div>

            {/* Phone Support */}
            <div className="bg-yellow-50 rounded-3xl p-12 text-center border border-yellow-200 shadow-xl">
              <div className="text-8xl mb-8">📞</div>
              <h2 className="text-4xl font-black text-teal-900 mb-6">
                Phone Support
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Speak directly with a specialist — immediate assistance
              </p>
              <p className="text-5xl font-black text-teal-900 mb-4">
                +234 803 123 4567
              </p>
              <p className="text-xl text-gray-600">
                Monday – Saturday<br />
                8:00 AM – 8:00 PM WAT
              </p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-5xl font-black text-teal-900 mb-12">
              Documentation & Resources
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-10">
              <a
                href="/resources"
                className="bg-teal-800 text-white px-16 py-8 rounded-full text-2xl font-bold hover:bg-teal-700 transition shadow-2xl inline-block"
              >
                Resource Library
              </a>
              <a
                href="/resources#learning-center"
                className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
              >
                Learning Center
              </a>
            </div>
          </div>

          <div className="mt-20 text-center">
            <Link
              href="/portal/dashboard"
              className="inline-block bg-teal-700 text-white px-16 py-8 rounded-full text-2xl font-bold hover:bg-teal-600 transition shadow-2xl"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}