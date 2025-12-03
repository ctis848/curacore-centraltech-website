// app/buy/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P');

export default function BuyLicense() {
  const handleCheckout = async (priceId: string) => {
    const stripe = await stripePromise;
    if (!stripe) return alert('Stripe failed to load');

    // @ts-ignore – we know it's the correct browser instance
    await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/portal/dashboard?success=true`,
      cancelUrl: `${window.location.origin}/buy`,
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-blue-900 mb-6">Get CuraCore EMR Today</h1>
          <p className="text-2xl text-gray-700 mb-16">The #1 Hospital System in Africa</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Starter */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition-all">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Starter</h2>
              <p className="text-6xl font-bold text-gray-900">$11<span className="text-2xl">/mo</span></p>
              <button onClick={() => handleCheckout('price_1STARTER_ID')} className="mt-10 w-full bg-blue-900 text-white py-6 rounded-xl text-2xl font-bold hover:bg-blue-800">
                Buy Starter
              </button>
            </div>

            {/* Pro – Most Popular */}
            <div className="bg-blue-900 text-white rounded-3xl shadow-2xl p-12 transform scale-110 border-4 border-yellow-400 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold text-lg">
                MOST POPULAR
              </div>
              <h2 className="text-4xl font-bold mb-4">Pro</h2>
              <p className="text-7xl font-bold">$15<span className="text-3xl">/mo</span></p>
              <button onClick={() => handleCheckout('price_1PRO_ID')} className="mt-10 w-full bg-white text-blue-900 py-6 rounded-xl text-2xl font-bold hover:bg-gray-100">
                Buy Pro Now
              </button>
            </div>

            {/* Lifetime */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition-all">
              <h2 className="text-3xl font-bold mb-4">Lifetime Deal</h2>
              <p className="text-6xl font-bold">$399<span className="text-2xl"> one-time</span></p>
              <button onClick={() => handleCheckout('price_1LIFETIME_ID')} className="mt-10 w-full bg-yellow-400 text-blue-900 py-6 rounded-xl text-2xl font-bold hover:bg-yellow-300">
                Buy Lifetime
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}