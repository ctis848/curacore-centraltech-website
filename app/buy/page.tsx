// app/buy/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

// YOUR REAL PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P');

export default function BuyLicense() {
  const handleCheckout = async (priceId: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/portal/dashboard`,
        cancelUrl: `${window.location.origin}/buy`,
      });
    } catch (err) {
      alert('Checkout failed. Try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-10 text-blue-900">Choose Your CuraCore Plan</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {/* Starter */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition">
              <h2 className="text-3xl font-bold text-blue-900">Starter</h2>
              <p className="text-6xl font-bold my-6">$11<span className="text-xl">/mo</span></p>
              <p className="text-gray-600 mb-8">Up to 5 users</p>
              <button
                onClick={() => handleCheckout('price_1YOUR_STARTER_ID')} 
                className="w-full bg-blue-900 text-white py-5 rounded-lg text-xl font-bold hover:bg-blue-800 transition"
              >
                Buy Starter
              </button>
            </div>

            {/* Pro - Most Popular */}
            <div className="bg-blue-900 text-white p-12 rounded-2xl shadow-2xl transform scale-105 border-4 border-yellow-400">
              <div className="bg-yellow-400 text-blue-900 inline-block px-6 py-2 rounded-full text-lg font-bold mb-4">MOST POPULAR</div>
              <h2 className="text-4xl font-bold">Pro</h2>
              <p className="text-7xl font-bold my-6">$15<span className="text-2xl">/mo</span></p>
              <p className="mb-10 text-xl">Up to 25 users</p>
              <button
                onClick={() => handleCheckout('price_1YOUR_PRO_ID')}
                className="w-full bg-white text-blue-900 py-5 rounded-lg text-xl font-bold hover:bg-gray-100 transition"
              >
                Buy Pro Now
              </button>
            </div>

            {/* Lifetime */}
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition">
              <h2 className="text-3xl font-bold text-green-600">Lifetime</h2>
              <p className="text-6xl font-bold my-6">$399<span className="text-xl"> one-time</span></p>
              <p className="text-gray-600 mb-8">Unlimited users forever</p>
              <button
                onClick={() => handleCheckout('price_1YOUR_LIFETIME_ID')}
                className="w-full bg-green-600 text-white py-5 rounded-lg text-xl font-bold hover:bg-green-700 transition"
              >
                Buy Lifetime
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}