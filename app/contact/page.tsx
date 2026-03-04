"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const phone = "2348012345678"; // your WhatsApp number
    const text = encodeURIComponent(
      `Hello CTIS,
My name is ${name}.
My email is ${email}.
Message: ${message}`
    );

    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HERO */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-teal-900/80 flex items-center justify-center text-center px-4">
          <div className="text-white space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl mx-auto">
              We’re here to support your hospital every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-3xl mx-auto w-full">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 space-y-6">

          <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 text-center">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-1">
                Name
              </label>
              <input
                className="p-3 sm:p-4 border border-teal-200 rounded-xl w-full focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                placeholder="Your full name"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-1">
                Email
              </label>
              <input
                type="email"
                className="p-3 sm:p-4 border border-teal-200 rounded-xl w-full focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                placeholder="Your email address"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-1">
                Message
              </label>
              <textarea
                className="p-3 sm:p-4 border border-teal-200 rounded-xl w-full h-32 sm:h-40 focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
                placeholder="How can we help you?"
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-lg hover:bg-green-700 transition"
            >
              Send via WhatsApp
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
