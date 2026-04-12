"use client";

import Link from "next/link";
import Image from "next/image";

export default function PricingPage() {
  const plans = [
    {
      id: "starter",
      title: "Starter",
      price: "₦250,000 (One‑Time)",
      desc: "Full access to all CentralCore EMR features — perfect for small clinics.",
      features: [
        "Complete EMR Suite",
        "All modules included",
        "Up to 5 users",
        "20% annual support fee included",
      ],
    },
    {
      id: "pro",
      title: "Pro",
      price: "₦350,000 (One‑Time)",
      desc: "Ideal for growing hospitals with more staff and departments.",
      features: [
        "Complete EMR Suite",
        "All modules included",
        "Up to 10 users",
        "20% annual support fee included",
      ],
      highlight: true,
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: "₦550,000 (One‑Time)",
      desc: "For large institutions, networks, and multi‑facility operations.",
      features: [
        "Complete EMR Suite",
        "All modules included",
        "Unlimited users",
        "20% annual support fee included",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">

      {/* HERO */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore Pricing"
          fill
          priority
          className="object-cover object-center scale-110 brightness-[0.85]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-900/70 to-teal-900/40 backdrop-blur-[3px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Pricing & Licensing
          </h1>

          <p className="text-xl md:text-2xl font-light max-w-3xl opacity-95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            Simple, transparent pricing designed for hospitals of all sizes.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-16">
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 dark:text-teal-300 text-center">
          Choose Your License
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-10 rounded-2xl shadow-xl border transition-all duration-300 hover:-translate-y-1 ${
                p.highlight
                  ? "bg-teal-700 text-white border-teal-800 shadow-teal-500/20 scale-[1.03]"
                  : "bg-white dark:bg-gray-800 dark:text-white border-teal-200 dark:border-gray-700"
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
