// app/contact/page.tsx
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Contact Us
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            Get in touch — we're ready to help modernize your healthcare facility
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <div className="text-6xl mb-6">📍</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Location</h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                Central Tech Information Systems Ltd.<br />
                Port Harcourt, Rivers State<br />
                Nigeria
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <div className="text-6xl mb-6">📞</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Phone</h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                +234 805 931 8564<br />
                Monday – Saturday<br />
                8:00 AM – 8:00 PM WAT
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-teal-100">
              <div className="text-6xl mb-6">✉️</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">Email</h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                info@CentralCore.com<br />
                support@CentralCore.com<br />
                sales@CentralCore.com
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-teal-100">
            <h2 className="text-4xl font-black text-teal-900 mb-10 text-center">
              Send Us a Message
            </h2>
            <form className="max-w-3xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input type="text" placeholder="Your Name" className="px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition" required />
                <input type="email" placeholder="Email Address" className="px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition" required />
              </div>
              <input type="text" placeholder="Hospital/Clinic Name" className="w-full px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition" />
              <textarea rows={6} placeholder="Your Message" className="w-full px-8 py-5 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 transition resize-none"></textarea>
              <div className="text-center">
                <button type="submit" className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl">
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