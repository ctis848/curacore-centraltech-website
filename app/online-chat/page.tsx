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
            Live Chat Support
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            We're Online 24/7 — Chat with Our Experts Now
          </p>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Get instant help with EMR setup, billing, technical issues, or any questions — day or night.
          </p>
        </div>
      </section>

      {/* Live Chat Interface */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-teal-100 overflow-hidden">
            {/* Header */}
            <div className="bg-teal-800 text-white p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-4xl font-black text-teal-900">
                  C
                </div>
                <div>
                  <h3 className="text-3xl font-black">CentralCore Support</h3>
                  <p className="text-xl text-teal-200">Live agents available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-2xl font-bold">Online</span>
              </div>
            </div>

            {/* Greeting */}
            <div className="p-10">
              <div className="bg-teal-100 rounded-3xl p-8 max-w-3xl">
                <p className="text-teal-900 text-2xl font-bold mb-4">
                  Hello! Welcome to CentralCore Live Support 👋
                </p>
                <p className="text-teal-800 text-xl leading-relaxed">
                  Our team is here around the clock to help you with anything — from EMR training to urgent technical support.
                </p>
                <p className="text-teal-700 text-lg mt-6">
                  Please fill in your details and type your message below. We'll respond immediately!
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-10 border-t-4 border-teal-200 bg-gray-50">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    required
                    className="px-8 py-6 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition"
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    required
                    className="px-8 py-6 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Hospital/Clinic Name"
                  className="w-full px-8 py-6 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition"
                />
                <textarea
                  placeholder="How can we help you today? *"
                  rows={8}
                  required
                  className="w-full px-8 py-6 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition resize-none"
                ></textarea>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-teal-900 px-24 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl"
                  >
                    Start Chat
                  </button>
                </div>
              </form>
              <p className="text-center text-gray-600 mt-10 text-lg">
                Your message is secure • Average response time: under 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}