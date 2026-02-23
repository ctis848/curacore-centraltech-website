// app/resources/page.tsx
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-900 py-28 md:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-teal-900 to-teal-950 opacity-90" />
        <div className="relative max-w-6xl mx-auto text-center text-white z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl">
            Resources
          </h1>
          <p className="text-xl md:text-3xl font-light max-w-4xl mx-auto drop-shadow-lg">
            Everything you need to succeed with CentralCore EMR — support, guides, stories, and updates
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 md:py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Support */}
            <Link href="/support" className="block group">
              <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col border border-teal-100">
                <div className="text-7xl mb-6 text-center">🎧</div>
                <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                  Support
                </h3>
                <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                  Get help from our expert team — email, phone, live chat, and documentation
                </p>
                <span className="text-teal-600 font-bold mt-6 text-center group-hover:text-yellow-400 transition-colors duration-200">
                  Go to Support →
                </span>
              </div>
            </Link>

            {/* Resource Library */}
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col border border-teal-100 opacity-80">
              <div className="text-7xl mb-6 text-center">📚</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                Resource Library
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                Download brochures, whitepapers, implementation guides, templates, and more
              </p>
              <span className="text-teal-500 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* Comparisons & Success Stories */}
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col border border-teal-100 opacity-80">
              <div className="text-7xl mb-6 text-center">🏆</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                Comparisons & Success Stories
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                See how CentralCore compares to competitors and read real client success stories
              </p>
              <span className="text-teal-500 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* Blog */}
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col border border-teal-100 opacity-80">
              <div className="text-7xl mb-6 text-center">📰</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                Blog
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                Healthcare technology trends, EMR tips, regulatory updates, and industry insights
              </p>
              <span className="text-teal-500 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* Learning Center */}
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col border border-teal-100 opacity-80">
              <div className="text-7xl mb-6 text-center">🎓</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                Learning Center
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                Video tutorials, webinars, on-demand training courses, and certification programs
              </p>
              <span className="text-teal-500 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* What's New */}
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 h-full flex flex-col border border-teal-100 opacity-80">
              <div className="text-7xl mb-6 text-center">✨</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                What's New
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1 leading-relaxed">
                Latest features, product updates, changelog, and release notes
              </p>
              <span className="text-teal-500 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 px-6 bg-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
            Need Help Right Now?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Our expert support team is ready to assist you 24/7 — reach out today
          </p>
          <Link
            href="/support"
            className="inline-block bg-yellow-400 text-teal-900 px-12 md:px-16 py-5 md:py-6 rounded-full text-xl md:text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl hover:scale-105 duration-300"
          >
            Contact Support Team
          </Link>
        </div>
      </section>
    </>
  );
}