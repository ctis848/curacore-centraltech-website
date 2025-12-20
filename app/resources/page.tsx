// app/resources/page.tsx
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            Resources
          </h1>
          <p className="text-2xl mb-12 max-w-4xl mx-auto">
            Everything you need to succeed with CuraCore EMR — support, guides, stories, and updates
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Support */}
            <Link href="/support" className="block group">
              <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300 h-full flex flex-col">
                <div className="text-6xl mb-6 text-center">🎧</div>
                <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                  Support
                </h3>
                <p className="text-lg text-gray-700 text-center flex-1">
                  Get help from our expert team — email, phone, and documentation
                </p>
                <span className="text-blue-600 font-bold mt-6 text-center group-hover:text-blue-800">
                  Go to Support →
                </span>
              </div>
            </Link>

            {/* Resource Library */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300 h-full flex flex-col">
              <div className="text-6xl mb-6 text-center">📚</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                Resource Library
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1">
                Download brochures, whitepapers, implementation guides, and templates
              </p>
              <span className="text-blue-600 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* Comparisons & Success Stories */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300 h-full flex flex-col">
              <div className="text-6xl mb-6 text-center">🏆</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                Comparisons & Success Stories
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1">
                See how CuraCore compares to competitors and real client success stories
              </p>
              <span className="text-blue-600 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* Blog */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300 h-full flex flex-col">
              <div className="text-6xl mb-6 text-center">📰</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                Blog
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1">
                Healthcare technology trends, EMR tips, and industry insights
              </p>
              <span className="text-blue-600 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* Learning Center */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300 h-full flex flex-col">
              <div className="text-6xl mb-6 text-center">🎓</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                Learning Center
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1">
                Video tutorials, webinars, training courses, and certification
              </p>
              <span className="text-blue-600 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>

            {/* What's New */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300 h-full flex flex-col">
              <div className="text-6xl mb-6 text-center">✨</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                What's New
              </h3>
              <p className="text-lg text-gray-700 text-center flex-1">
                Latest features, updates, changelog, and release notes
              </p>
              <span className="text-blue-600 font-bold mt-6 text-center">
                Coming Soon →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-8">
            Need Help Now?
          </h2>
          <Link
            href="/support"
            className="bg-yellow-400 text-blue-900 px-12 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 inline-block"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}