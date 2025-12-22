// app/support/page.tsx
import Link from 'next/link';

export default function SupportPage() {
  return (
    <>
      {/* Hero Section - Same as Products/Resources */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            CuraCore Support Center
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            We're here to help you get the most out of CuraCore EMR
          </p>
        </div>
      </section>

      {/* Support Options Grid - Same Card Style */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Email Support */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 text-center">🎧</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                Email Support
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                Get help from our expert team — email, phone, and documentation
              </p>
              <Link
                href="mailto:support@curacore.com"
                className="block w-full bg-teal-800 text-white py-5 rounded-xl text-xl font-bold hover:bg-teal-700 mt-8 transition text-center"
              >
                Email Us →
              </Link>
            </div>

            {/* Phone Support */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 text-center">📞</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                Phone Support
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                Speak directly with a specialist during business hours
              </p>
              <div className="mt-8">
                <p className="text-3xl font-bold text-teal-900 mb-2">+234 805 931 8564</p>
                <p className="text-teal-600 font-bold">Mon-Fri 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Same Style */}
      <section className="py-24 px-6 bg-teal-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-8">
            Need Help Now?
          </h2>
          <Link
            href="/portal/dashboard"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 inline-block shadow-2xl transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </>
  );
}