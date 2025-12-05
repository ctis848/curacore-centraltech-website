// app/buy/page.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// THIS LINE IS THE OFFICIAL STRIPE FIX — IT FORCES THE CORRECT TYPE
import type { Stripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P'
);

export default function BuyLicense() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);

    // THIS LINE FORCES THE CORRECT CLIENT TYPE — NO MATTER WHAT
    const stripe = (await stripePromise) as Stripe | null;

    if (!stripe) {
      alert('Stripe failed to load');
      setLoading(null);
      return;
    }

    try {
      await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: priceId === 'price_1SaNJmECEzFismm5fDBhO46P' ? 'payment' : 'subscription',
        successUrl: `${window.location.origin}/portal/dashboard?success=true&plan=${planName}`,
        cancelUrl: `${window.location.origin}/buy?canceled=true`,
      });
    } catch (err) {
      console.error(err);
      alert('Checkout failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-8">
          Get CuraCore EMR Today
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">

          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition-all">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Starter</h2>
            <p className="text-6xl font-bold text-gray-900 mb-2">$11<span className="text-2xl font-normal">/month</span></p>
            <button
              onClick={() => handleCheckout('price_1SaN5sECEzFismm5enqBvUCk', 'Starter')}
              disabled={!!loading}
              className="w-full mt-8 bg-blue-900 text-white py-5 rounded-xl text-xl font-bold hover:bg-blue-800 disabled:opacity-60"
            >
              {loading === 'Starter' ? 'Loading...' : 'Buy Starter'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-3xl shadow-2xl p-12 transform scale-110 border-8 border-yellow-400 relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-10 py-3 rounded-full text-xl font-black">
              MOST POPULAR
            </div>
            <h2 className="text-4xl font-bold mb-4">Pro</h2>
            <p className="text-7xl font-bold mb-2">$15<span className="text-3xl font-normal">/month</span></p>
            <button
              onClick={() => handleCheckout('price_1SaNH7ECEzFismm5X0PzxHOT', 'Pro')}
              disabled={!!loading}
              className="w-full mt-10 bg-white text-blue-900 py-6 rounded-xl text-2xl font-bold hover:bg-gray-100 disabled:opacity-60"
            >
              {loading === 'Pro' ? 'Loading...' : 'Buy Pro Now'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition-all">
            <h2 className="text-3xl font-bold mb-4">Lifetime Deal</h2>
            <p className="text-6xl font-bold mb-2">$399<span className="text-2xl font-normal"> one-time</span></p>
            <button
              onClick={() => handleCheckout('price_1SaNJmECEzFismm5fDBhO46P', 'Lifetime')}
              disabled={!!loading}
              className="w-full mt-10 bg-yellow-400 text-blue-900 py-6 rounded-xl text-xl font-bold hover:bg-yellow-300 disabled:opacity-60"
            >
              {loading === 'Lifetime' ? 'Loading...' : 'Buy Lifetime Access'}
            </button>
          </div>

        </div>

        <p className="mt-20 text-sm text-gray-500">
          Test mode • Card: 4242 4242 4242 4242
        </p>
      </div>
    </div>
  );
}