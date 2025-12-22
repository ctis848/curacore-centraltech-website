// app/chat/page.tsx
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
          <p className="text-xl opacity-90">
            Chat with us now or leave a message — we'll respond as soon as possible
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
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-2xl font-bold">
                  C
                </div>
                <div>
                  <h3 className="text-2xl font-black">CuraCore Support</h3>
                  <p className="text-teal-200">Typically replies in minutes</p>
                </div>
              </div>
              <div className="text-green-300 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold">Online</span>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="p-8">
              <div className="bg-teal-100 rounded-2xl p-6 max-w-md">
                <p className="text-teal-900 font-semibold mb-2">
                  Hello! 👋 Welcome to CuraCore Support
                </p>
                <p className="text-teal-800">
                  How can we help you today? We're available 24/7 to assist with EMR setup, billing, technical issues, or any questions.
                </p>
                <p className="text-sm text-teal-700 mt-4">
                  — CuraCore Team
                </p>
              </div>
            </div>

            {/* Chat Form */}
            <div className="p-8 border-t border-teal-200">
              <form className="space-y-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
                  required
                />
                <input
                  type="text"
                  placeholder="Hospital / Clinic Name (optional)"
                  className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
                />
                <textarea
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition resize-none"
                  required
                ></textarea>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
                  >
                    Send Message
                  </button>
                </div>
              </form>
              <p className="text-center text-gray-600 mt-8 text-sm">
                We'll reply via email within minutes during business hours, or as soon as we're online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-10">
            Other Ways to Reach Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-teal-50 rounded-3xl p-8 border border-teal-200">
              <div className="text-6xl mb-6">📞</div>
              <h3 className="text-2xl font-bold text-teal-900 mb-4">Phone</h3>
              <p className="text-xl text-gray-700">+234 805 931 8564</p>
              <p className="text-gray-600 mt-2">Mon-Sat 8AM-8PM</p>
            </div>
            <div className="bg-teal-50 rounded-3xl p-8 border border-teal-200">
              <div className="text-6xl mb-6">✉️</div>
              <h3 className="text-2xl font-bold text-teal-900 mb-4">Email</h3>
              <p className="text-xl text-gray-700">support@curacore.com</p>
              <p className="text-gray-600 mt-2">Response within 4 hours</p>
            </div>
            <div className="bg-teal-50 rounded-3xl p-8 border border-teal-200">
              <div className="text-6xl mb-6">🎫</div>
              <h3 className="text-2xl font-bold text-teal-900 mb-4">Portal</h3>
              <Link
                href="/portal/dashboard"
                className="text-xl text-teal-700 font-bold hover:underline"
              >
                Login to Client Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}