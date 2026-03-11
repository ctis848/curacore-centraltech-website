'use client';

export default function HotelOnboardingPage() {
  return (
    <>
      <section className="bg-teal-900 text-white py-32 px-6 text-center">
        <h1 className="text-6xl font-black mb-6">Hotel Onboarding</h1>
        <p className="text-2xl max-w-3xl mx-auto">
          Start your journey with CentralCore + CloudBeds in a few simple steps.
        </p>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: '1',
              title: 'Create Your Account',
              desc: 'Register your hotel and set up your CentralCore dashboard.',
            },
            {
              step: '2',
              title: 'Connect CloudBeds',
              desc: 'Link your CloudBeds PMS for unified operations.',
            },
            {
              step: '3',
              title: 'Go Live',
              desc: 'Start managing guests, bookings, and operations instantly.',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-teal-50 rounded-3xl shadow-lg p-10 border border-teal-200 text-center"
            >
              <div className="text-6xl font-black text-teal-700 mb-4">{s.step}</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">{s.title}</h3>
              <p className="text-lg text-gray-700 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/demo"
            className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-xl inline-block"
          >
            Start Onboarding
          </a>
        </div>
      </section>
    </>
  );
}
