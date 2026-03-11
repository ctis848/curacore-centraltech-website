'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>

        <div className="relative max-w-5xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Book a Demo for Your Hotel
          </h1>

          <p className="text-2xl md:text-3xl mb-12 font-light max-w-3xl mx-auto drop-shadow-lg">
            Discover how CentralCore + CloudBeds can transform your hotel operations, 
            boost revenue, and elevate guest experiences.
          </p>
        </div>
      </section>

      {/* CloudBeds Partner Badge */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-700 mb-4">Proud Technology Partner</p>

          <div className="inline-flex items-center gap-4 bg-gray-100 px-8 py-4 rounded-full shadow-md border border-gray-200">
            <span className="text-3xl">🤝</span>
            <span className="text-2xl font-bold text-teal-900">CloudBeds Partner</span>
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-12 border border-gray-200">
          <h2 className="text-4xl font-black text-teal-900 text-center mb-10">
            Request a Personalized Demo
          </h2>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Hotel / Property Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Message (Optional)</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                ></textarea>
              </div>

              <div className="md:col-span-2 text-center mt-6">
                <button
                  type="submit"
                  className="bg-teal-700 text-white px-16 py-4 rounded-full text-2xl font-bold hover:bg-teal-800 transition shadow-xl"
                >
                  Submit Request
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-4xl font-bold text-teal-800 mb-4">Thank You!</h3>
              <p className="text-xl text-gray-700">
                Your demo request has been received. Our team will contact you shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black text-teal-900 mb-12">
            Why Hotels Choose CentralCore + CloudBeds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: '⚡',
                title: 'Faster Operations',
                desc: 'Automate check‑ins, housekeeping, billing, and guest communication.',
              },
              {
                icon: '📈',
                title: 'Higher Revenue',
                desc: 'Smart pricing, occupancy forecasting, and channel optimization.',
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                desc: 'Connect to 300+ booking channels with CloudBeds Channel Manager.',
              },
            ].map((b, i) => (
              <div
                key={i}
                className="bg-teal-50 rounded-3xl shadow-lg p-10 border border-teal-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-6xl mb-6">{b.icon}</div>
                <h3 className="text-3xl font-bold text-teal-900 mb-4">{b.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Ready to Transform Your Hotel?
          </h2>

          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            Experience the power of CentralCore + CloudBeds in a personalized demo session.
          </p>

          <a
            href="https://www.cloudbeds.com/request-a-demo/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Request a Demo Now
          </a>
        </div>
      </section>
    </>
  );
}
