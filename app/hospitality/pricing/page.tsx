'use client';

export default function HospitalityPricingPage() {
  return (
    <>
      <section className="bg-teal-900 text-white py-32 px-6 text-center">
        <h1 className="text-6xl font-black mb-6">Hospitality Pricing</h1>
        <p className="text-2xl max-w-3xl mx-auto">
          Flexible pricing designed for hotels, resorts, guest houses, and serviced apartments.
        </p>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              name: 'Starter',
              price: '$49/mo',
              features: [
                'Basic PMS',
                'Reservations',
                'Guest Profiles',
                'Email Support',
              ],
            },
            {
              name: 'Professional',
              price: '$129/mo',
              features: [
                'Full PMS',
                'Channel Manager',
                'Revenue Tools',
                'Guest Automation',
                'Priority Support',
              ],
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              features: [
                'All Features',
                'API Access',
                'Custom Integrations',
                'Dedicated Manager',
              ],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-xl p-10 border border-teal-200 hover:shadow-2xl transition"
            >
              <h3 className="text-4xl font-bold text-teal-900 mb-4">{plan.name}</h3>
              <p className="text-5xl font-black text-teal-700 mb-6">{plan.price}</p>

              <ul className="text-lg text-gray-700 space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j}>• {f}</li>
                ))}
              </ul>

              <a
                href="https://www.cloudbeds.com/pricing/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-teal-700 text-white py-4 rounded-full font-bold text-xl hover:bg-teal-800 transition"
              >
                View CloudBeds Pricing
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
