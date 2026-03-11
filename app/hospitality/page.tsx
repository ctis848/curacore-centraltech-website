'use client';

export default function HospitalityPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>

        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Hospitality Solutions Powered by CloudBeds
          </h1>

          <p className="text-2xl md:text-3xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            Modern hotel operations, automated guest experiences, and unified property management — 
            seamlessly integrated with CentralCore.
          </p>

          <a
            href="https://www.cloudbeds.com/request-a-demo/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Book a Demo
          </a>
        </div>
      </section>

      {/* CloudBeds Partner Badge */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-700 mb-4">Proud Technology Partner</p>

          <div className="inline-flex items-center gap-4 bg-gray-100 px-8 py-4 rounded-full shadow-md border border-gray-200">
            <span className="text-3xl">🤝</span>
            <span className="text-2xl font-bold text-teal-900">CloudBeds Partner</span>
          </div>
        </div>
      </section>

      {/* CloudBeds Logo Strip */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-black text-teal-900 mb-10">Powered by Industry Leaders</h3>

          <div className="flex justify-center">
            <img
              src="/cloudbeds-logo.png"
              alt="CloudBeds Logo"
              className="h-20 opacity-90 hover:opacity-100 transition"
            />
          </div>
        </div>
      </section>

      {/* Hospitality Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 mb-6">
            Complete Hospitality Management Suite
          </h2>

          <p className="text-2xl text-gray-700 max-w-4xl mx-auto mb-16 leading-relaxed">
            From reservations to revenue management, CloudBeds + CentralCore delivers 
            a unified platform for hotels, resorts, guest houses, and serviced apartments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: '🏨',
                title: 'Property Management System (PMS)',
                description: 'Front desk operations, room assignments, housekeeping, and guest profiles.',
              },
              {
                icon: '🛏️',
                title: 'Reservations & Booking Engine',
                description: 'Real‑time availability, channel manager sync, and direct booking tools.',
              },
              {
                icon: '📊',
                title: 'Revenue Management',
                description: 'Smart pricing, occupancy forecasting, and revenue optimization dashboards.',
              },
              {
                icon: '🤝',
                title: 'Guest Experience Automation',
                description: 'Self‑check‑in, digital keys, automated messaging, and personalized journeys.',
              },
              {
                icon: '🧾',
                title: 'Billing & Invoicing',
                description: 'Integrated billing for rooms, POS, services, and hospitality packages.',
              },
              {
                icon: '🔗',
                title: 'CloudBeds Integration',
                description: 'Seamless data sync between CentralCore and CloudBeds for unified operations.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-teal-50 rounded-3xl shadow-lg p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-teal-200"
              >
                <div className="text-6xl mb-6">{item.icon}</div>
                <h3 className="text-3xl font-bold text-teal-900 mb-4">{item.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-teal-900 text-center mb-16">
            Why CentralCore + CloudBeds?
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-3xl shadow-xl border border-gray-200">
              <thead>
                <tr className="bg-teal-800 text-white text-xl">
                  <th className="p-6 text-left">Feature</th>
                  <th className="p-6 text-left">CentralCore + CloudBeds</th>
                  <th className="p-6 text-left">Traditional Systems</th>
                </tr>
              </thead>

              <tbody className="text-lg">
                <tr className="border-b">
                  <td className="p-6">Unified Healthcare + Hospitality</td>
                  <td className="p-6 font-bold text-teal-700">Yes</td>
                  <td className="p-6 text-gray-500">No</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6">CloudBeds PMS Integration</td>
                  <td className="p-6 font-bold text-teal-700">Yes</td>
                  <td className="p-6 text-gray-500">No</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6">Real‑time Sync</td>
                  <td className="p-6 font-bold text-teal-700">Instant</td>
                  <td className="p-6 text-gray-500">Delayed</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6">Guest + Patient Profiles</td>
                  <td className="p-6 font-bold text-teal-700">Unified</td>
                  <td className="p-6 text-gray-500">Separate</td>
                </tr>

                <tr>
                  <td className="p-6">Automation & AI</td>
                  <td className="p-6 font-bold text-teal-700">Advanced</td>
                  <td className="p-6 text-gray-500">Basic</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-16">
            <a
              href="https://www.cloudbeds.com/request-a-demo/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-xl inline-block"
            >
              Book a Demo for Hotels
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Transform Your Hospitality Operations
          </h2>

          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            Deliver exceptional guest experiences with the combined power of CentralCore and CloudBeds.
          </p>

          <a
            href="https://www.cloudbeds.com/pricing/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Explore Pricing
          </a>
        </div>
      </section>
    </>
  );
}
