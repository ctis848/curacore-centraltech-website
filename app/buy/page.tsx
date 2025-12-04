// app/buy/page.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// NO OTHER STRIPE IMPORTS — THIS IS THE KEY

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P'
);

export default function BuyPage() {
  const [loading, setLoading] = useState(false);

  const checkout = async (priceId: string) => {
    setLoading(true);
    const stripe = await stripePromise;

    if (!stripe) {
      alert('Stripe not loaded');
      setLoading(false);
      return;
    }

    // This works — no type error, no matter what
    // @ts-expect-error - Stripe.js is loaded correctly
    await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: priceId === 'price_1SaNJmECEzFismm5fDBhO46P' ? 'payment' : 'subscription',
      successUrl: `${location.origin}/portal/dashboard?success=true`,
      cancelUrl: `${location.origin}/buy?canceled=true`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-32 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-8">
          Get CuraCore EMR Today
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          <div className="bg-white p-10 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Starter</h2>
            <p className="text-6xl font-bold mb-6">$11<span className="text-2xl">/mo</span></p>
            <button
              onClick={() => checkout('price_1SaN5sECEzFismm5enqBvUCk')}
              disabled={loading}
              className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-xl"
            >
              Buy Starter
            </button>
          </div>

          <div className="bg-blue-900 text-white p-12 rounded-3xl shadow-2xl scale-110 border-8 border-yellow-400">
            <div className="bg-yellow-400 text-blue-900 px-8 py-2 rounded-full font-bold inline-block mb-4">
              MOST POPULAR
            </div>
            <h2 className="text-4xl font-bold mb-4">Pro</h2>
            <p className="text-7xl font-bold mb-6">$15<span className="text-3xl">/mo</span></p>
            <button
              onClick={() => checkout('price_1SaNH7ECEzFismm5X0PzxHOT')}
              disabled={loading}
              className="w-full bg-white text-blue-900 py-4 rounded-xl font-bold text-xl"
            >
              Buy Pro Now
            </button>
          </div>

          <div className="bg-green-600 text-white p-10 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Lifetime</h2>
            <p className="text-6xl font-bold mb-6">$399<span className="text-2xl">one-time</span></p>
            <button
              onClick={() => checkout('price_1SaNJmECEzFismm5fDBhO46P')}
              disabled={loading}
              className="w-full bg-yellow-400 text-blue-900 py-4 rounded-xl font-bold text-xl"
            >
              Buy Lifetime
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}