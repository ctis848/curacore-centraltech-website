// app/contact/page.tsx
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-900 py-28 md:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-teal-900 to-teal-950 opacity-90" />
        <div className="relative max-w-6xl mx-auto text-center text-white z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl">
            Contact Us
          </h1>
          <p className="text-xl md:text-3xl font-light max-w-4xl mx-auto drop-shadow-lg">
            We're here to help you modernize your healthcare facility — get in touch today
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 md:py-24 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-20">
            {/* Location Card */}
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100 transition hover:shadow-2xl">
              <div className="text-6xl mb-6">📍</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Our Location</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Central Tech Information Systems Ltd.<br />
                Port Harcourt, Rivers State<br />
                Nigeria
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100 transition hover:shadow-2xl">
              <div className="text-6xl mb-6">📞</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Phone</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                +234 805 931 8564<br />
                Monday – Saturday<br />
                8:00 AM – 8:00 PM WAT
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100 transition hover:shadow-2xl">
              <div className="text-6xl mb-6">✉️</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Email</h3>
              <p className="text-lg text-gray-700 leading-relaxed space-y-1">
                <a href="mailto:info@ctistech.com" className="hover:text-teal-600 transition">
                  info@ctistech.com
                </a><br />
                <a href="mailto:support@ctistech.com" className="hover:text-teal-600 transition">
                  support@ctistech.com
                </a><br />
                <a href="mailto:sales@ctistech.com" className="hover:text-teal-600 transition">
                  sales@ctistech.com
                </a>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 border border-teal-100">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-10 text-center">
              Send Us a Message
            </h2>

            <form className="max-w-3xl mx-auto space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-lg font-medium text-teal-900 mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-lg font-medium text-teal-900 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clinic" className="block text-lg font-medium text-teal-900 mb-2">
                  Hospital / Clinic Name (optional)
                </label>
                <input
                  id="clinic"
                  type="text"
                  placeholder="Your facility name"
                  className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-lg font-medium text-teal-900 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="How can we help modernize your healthcare facility?"
                  required
                  className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition outline-none resize-none"
                />
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-300 text-teal-900 px-16 py-6 rounded-full text-2xl font-bold transition shadow-2xl transform hover:scale-105"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}