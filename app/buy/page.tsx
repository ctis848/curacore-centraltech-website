// app/buy/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

// YOUR REAL PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P');

export default function BuyLicense() {
  const handleCheckout = async (priceId: string) => {
    const stripe = await stripePromise;
    if (!stripe) return alert('Stripe not loaded');

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Get CuraCore Today
          </h1>
          <p className="text-xl text-gray-700 mb-16">Choose the perfect plan for your hospital</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Starter</h2>
              <p className="text-6xl font-bold text-gray-900">$11<span className="text-2xl">/mo</span></p>
              <p className="text-gray-600 my-6">Perfect for small clinics</p>
              <ul className="text-left text-gray-700 mb-8 space-y-3">
                <li>✓ Up to 5 users</li>
                <li>✓ Patient records</li>
                <li>✓ Basic billing</li>
              </ul>
              <button
                onClick={() => handleCheckout('price_1StarterID_REPLACE_ME')}
                className="w-full bg-blue-900 text-white py-5 rounded-xl text-xl font-bold hover:bg-blue-800 transition"
              >
                Buy Starter
              </button>
            </div>

            {/* Pro — Most Popular */}
            <div className="bg-blue-900 text-white rounded-3xl shadow-2xl p-12 transform scale-110 border-4 border-yellow-400">
              <div className="bg-yellow-400 text-blue-900 inline-block px-6 py-2 rounded-full font-bold mb-4">
                MOST POPULAR
              </div>
              <h2 className="text-4xl font-bold mb-4">Pro</h2>
              <p className="text-7xl font-bold">$15<span className="text-3xl">/mo</span></p>
              <p className="text-xl my-6">Best for growing hospitals</p>
              <ul className="text-left mb-10 space-y-3">
                <li>✓ Up to 25 users</li>
                <li>✓ Full EMR + inventory</li>
                <li>✓ Lab & pharmacy</li>
                <li>✓ Priority support</li>
              </ul>
              <button
                onClick={() => handleCheckout('price_1ProID_REPLACE_ME')}
                className="w-full bg-white text-blue-900 py-5 rounded-xl text-xl font-bold hover:bg-gray-100 transition"
              >
                Buy Pro Now
              </button>
            </div>

            {/* Lifetime */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition">
              <h2 className="text-3xl font-bold mb-4">Lifetime Deal</h2>
              <p className="text-6xl font-bold">$399<span className="text-2xl"> one-time</span></p>
              <p className="my-6">Own it forever</p>
              <ul className="text-left mb-8 space-y-3">
                <li>✓ Unlimited users</li>
                <li>✓ All Pro features</li>
                <li>✓ Lifetime updates</li>
                <li>✓ No monthly fees</li>
              </ul>
              <button
                onClick={() => handleCheckout('price_1LifetimeID_REPLACE_ME')}
                className="w-full bg-yellow-400 text-blue-900 py-5 rounded-xl text-xl font-bold hover:bg-yellow-300 transition"
              >
                Buy Lifetime Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}