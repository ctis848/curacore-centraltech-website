'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PricingPage() {
  const plans = [
    {
      id: 'basic',
      title: 'Basic License',
      price: '₦150,000',
      desc: 'Perfect for small clinics and consulting rooms.',
      features: [
        'EMR Core Features',
        'Patient Records',
        'Basic Reporting',
        '1 Device License'
      ]
    },
    {
      id: 'standard',
      title: 'Standard License',
      price: '₦350,000',
      desc: 'Ideal for medium-sized hospitals.',
      features: [
        'Everything in Basic',
        'Pharmacy Module',
        'Laboratory Module',
        '5 Device Licenses'
      ],
      highlight: true
    },
    {
      id: 'enterprise',
      title: 'Enterprise License',
      price: '₦750,000',
      desc: 'For large hospitals with advanced needs.',
      features: [
        'Everything in Standard',
        'Radiology Module',
        'Nurse Call System',
        'Unlimited Devices'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore Pricing"
          fill
          priority
          className="object-cover object-center scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-xl tracking-tight">
            Pricing & Licensing
          </h1>

          <p className="text-xl md:text-2xl font-light max-w-3xl drop-shadow-lg">
            Simple, transparent pricing designed for hospitals of all sizes.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-16">
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 text-center">
          Choose Your License
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`p-10 rounded-2xl shadow-lg border ${
                p.highlight
                  ? "bg-teal-700 text-white border-teal-800 scale-[1.03]"
                  : "bg-white/90 backdrop-blur-sm border-teal-200"
              }`}
            >
              <h3 className="text-3xl font-bold mb-3">{p.title}</h3>
              <p className="text-4xl font-black mb-4">{p.price}</p>
              <p className="mb-6 opacity-90">{p.desc}</p>

              <ul className="space-y-3 mb-8">
                {p.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-500 text-xl">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/buy?plan=${p.id}`}
                className={`block text-center py-3 rounded-xl font-semibold transition ${
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
