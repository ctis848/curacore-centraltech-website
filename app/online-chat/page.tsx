// app/online-chat/page.tsx
import Link from 'next/link';

export default function OnlineChatPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Online Support Chat
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            We're here for you 24/7 — get instant help from our expert team
          </p>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Chat with us now or leave a message — we'll respond as soon as possible, even outside business hours.
          </p>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-teal-100 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-teal-800 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-3xl font-black text-teal-900">
                  C
                </div>
                <div>
                  <h3 className="text-2xl font-black">CuraCore Support Team</h3>
                  <p className="text-teal-200">Available 24/7 • Typically replies in minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-lg">Online Now</span>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="p-10">
              <div className="bg-teal-100 rounded-3xl p-8 max-w-2xl">
                <p className="text-teal-900 text-xl font-semibold mb-4">
                  Hello! 👋 Welcome to CuraCore Support
                </p>
                <p className="text-teal-800 text-lg leading-relaxed">
                  Thank you for choosing CuraCore EMR. We're here 24/7 to help with:
                </p>
                <ul className="mt-4 text-teal-800 text-lg space-y-2">
                  <li>• EMR setup and training</li>
                  <li>• Billing and license questions</li>
                  <li>• Technical issues</li>
                  <li>• Feature requests</li>
                  <li>• Anything else!</li>
                </ul>
                <p className="text-sm text-teal-700 mt-6">
                  — Your CuraCore Support Team
                </p>
              </div>
            </div>

            {/* Message Form */}
            <div className="p-10 border-t-4 border-teal-200 bg-gray-50">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    className="px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email Address *"
                    className="px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Hospital / Clinic Name (optional)"
                  className="w-full px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
                />
                <textarea
                  placeholder="Describe your question or issue... *"
                  rows={7}
                  className="w-full px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition resize-none"
                  required
                ></textarea>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-teal-900 px-20 py-7 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
                  >
                    Send Message
                  </button>
                </div>
              </form>
              <p className="text-center text-gray-600 mt-10 text-lg">
                We monitor messages 24/7 • Expect a reply within minutes during business hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contacts */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-12">
            Other Ways to Reach Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-teal-50 rounded-3xl p-10 border border-teal-200 shadow-xl">
              <div className="text-7xl mb-6">📞</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Call Us</h3>
              <p className="text-2xl text-teal-800 font-bold">+234 805 931 8564</p>
              <p className="text-gray-600 mt-2">Mon-Sat • 8AM - 8PM WAT</p>
            </div>
            <div className="bg-teal-50 rounded-3xl p-10 border border-teal-200 shadow-xl">
              <div className="text-7xl mb-6">✉️</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Email</h3>
              <a href="mailto:support@curacore.com" className="text-2xl text-teal-800 font-bold hover:underline">
                support@curacore.com
              </a>
              <p className="text-gray-600 mt-2">Response within 4 hours</p>
            </div>
            <div className="bg-teal-50 rounded-3xl p-10 border border-teal-200 shadow-xl">
              <div className="text-7xl mb-6">🎫</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Client Portal</h3>
              <Link
                href="/portal/dashboard"
                className="text-2xl text-teal-800 font-bold hover:underline"
              >
                Login to Your Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}