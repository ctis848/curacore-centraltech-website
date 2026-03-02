'use client';

import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="Contact CentralCore"
          fill
          priority
          className="object-cover object-center scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-xl tracking-tight">
            Contact Us
          </h1>

          <p className="text-xl md:text-2xl font-light max-w-3xl drop-shadow-lg">
            We’re here to help you with installation, support, and licensing.
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-24 px-6 md:px-10 max-w-5xl mx-auto space-y-16">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200">
          <h2 className="text-4xl font-black text-teal-800 mb-10 text-center">
            Send Us a Message
          </h2>

          <form className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            />

            <textarea
              placeholder="Your Message"
              rows={6}
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            />

            <button
              type="submit"
              className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* CONTACT INFO */}
        <div className="text-center text-gray-700">
          <p className="text-xl">Central Tech Information Systems Ltd.</p>
          <p className="text-lg mt-2">Lagos, Nigeria</p>
          <p className="text-lg mt-2">Email: info@ctistech.com</p>
        </div>
      </section>
    </div>
  );
}
