'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PricingPage() {
  const plans = [
    {
      id: 'starter',
      title: 'Starter',
      price: '₦10,000 (One‑Time)',
      desc: 'Full access to all CentralCore EMR features — perfect for small clinics.',
      features: [
        'Complete EMR: Patient Records, Appointments, Billing, Pharmacy, Lab, Radiology, Inventory, Wards, Nurses Module, Messaging, HL7, Reports & more',
        'All modules and integrations included',
        'Maximum 5 users (seats/licenses)',
        '20% annual support fee included'
      ]
    },
    {
      id: 'pro',
      title: 'Pro',
      price: '₦20,000 (One‑Time)',
      desc: 'Full access to all CentralCore EMR features — ideal for growing hospitals.',
      features: [
        'Complete EMR: Patient Records, Appointments, Billing, Pharmacy, Lab, Radiology, Inventory, Wards, Nurses Module, Messaging, HL7, Reports & more',
        'All modules and integrations included',
        'Maximum 15 users (seats/licenses)',
        '20% annual support fee included'
      ],
      highlight: true
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      price: '₦350,999 (One‑Time)',
      desc: 'Full access to all CentralCore EMR features — for large institutions & networks.',
      features: [
        'Complete EMR: Patient Records, Appointments, Billing, Pharmacy, Lab, Radiology, Inventory, Wards, Nurses Module, Messaging, HL7, Reports & more',
        'All modules and integrations included',
        'Unlimited users (seats/licenses)',
        '20% annual support fee included'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore Pricing"
          fill
          priority
          className="object-cover object-center scale-110 sm:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 drop-shadow-xl tracking-tight leading-tight">
            Pricing & Licensing
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl drop-shadow-lg leading-relaxed">
            Simple, transparent pricing designed for hospitals of all sizes.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-teal-800 text-center leading-tight">
          Choose Your License
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg border transition-transform ${
                p.highlight
                  ? "bg-teal-700 text-white border-teal-800 scale-[1.02]"
                  : "bg-white/90 backdrop-blur-sm border-teal-200"
              }`}
            >
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{p.title}</h3>
              <p className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4">{p.price}</p>
              <p className="mb-5 sm:mb-6 opacity-90 text-sm sm:text-base leading-relaxed">{p.desc}</p>

              <ul className="space-y-3 mb-6 sm:mb-8 text-sm sm:text-base">
                {p.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 text-lg sm:text-xl mt-1">✔</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/buy?plan=${p.id}`}
                className={`block text-center py-3 rounded-xl font-semibold text-sm sm:text-base transition ${
                  p.highlight
                    ? "bg-white text-teal-900 hover:bg-gray-100"
                    : "bg-teal-700 text-white hover:bg-teal-800"
                }`}
              >
                Buy Now
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
