// app/buy/page.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// ZERO imports from 'stripe' package allowed
// NO "import Stripe", NO "new Stripe()", NO server SDK at all

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P'
);

export default function BuyLicense() {
  const [loading, setLoading] = useState<string | null>(null);

  const go = async (priceId: string, name: string) => {
    setLoading(name);
    const stripe = await stripePromise;
    if (!stripe) return alert('Stripe not loaded');

    await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: priceId.includes('price_1SaNJm') ? 'payment' : 'subscription',
      successUrl: `${location.origin}/portal/dashboard?success=true&plan=${name}`,
      cancelUrl: `${location.origin}/buy`,
    });
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-8">
          Get CuraCore EMR Today
        </h1>
        <p className="text-2xl text-gray-700 mb-16">The #1 Hospital System in Africa</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">

          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Starter</h2>
            <p className="text-6xl font-bold text-gray-900">$11<span className="text-2xl font-normal">/month</span></p>
            <button onClick={() => go('price_1SaN5sECEzFismm5enqBvUCk', 'Starter')} disabled={loading === 'Starter'}
              className="mt-8 w-full bg-blue-900 text-white py-5 rounded-xl text-xl font-bold hover:bg-blue-800 disabled:opacity-50">
              {loading === 'Starter' ? 'Loading…' : 'Buy Starter'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-3xl shadow-2xl p-12 scale-110 border-8 border-yellow-400 relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-8 py-2 rounded-full text-lg font-black">
              MOST POPULAR
            </div>
            <h2 className="text-4xl font-bold mb-4">Pro</h2>
            <p className="text-7xl font-bold">$15<span className="text-3xl font-normal">/month</span></p>
            <button onClick={() => go('price_1SaNH7ECEzFismm5X0PzxHOT', 'Pro')} disabled={loading === 'Pro'}
              className="mt-10 w-full bg-white text-blue-900 py-5 rounded-xl text-2xl font-bold hover:bg-gray-100 disabled:opacity-50">
              {loading === 'Pro' ? 'Loading…' : 'Buy Pro Now'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition">
            <h2 className="text-3xl font-bold mb-4">Lifetime Deal</h2>
            <p className="text-6xl font-bold text-gray-900">$399<span className="text-2xl font-normal"> one-time</span></p>
            <button onClick={() => go('price_1SaNJmECEzFismm5fDBhO46P', 'Lifetime')} disabled={loading === 'Lifetime'}
              className="mt-8 w-full bg-yellow-400 text-blue-900 py-5 rounded-xl text-xl font-bold hover:bg-yellow-300 disabled:opacity-50">
              {loading === 'Lifetime' ? 'Loading…' : 'Buy Lifetime Access'}
            </button>
          </div>

        </div>

        <p className="mt-20 text-sm text-gray-500">
          Test mode — Use card 4242 4242 4242 4242
        </p>
      </div>
    </div>
  );
}