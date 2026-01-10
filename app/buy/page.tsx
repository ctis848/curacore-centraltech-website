// app/buy/page.tsx
'use client'; // ← THIS IS THE KEY LINE — makes it a Client Component

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
// ... your other imports

// If you have Stripe promise or window-related code, move it here
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BuyPage() {
  const [quantity, setQuantity] = useState(1);
  const [plan, setPlan] = useState('starter');
  const [loading, setLoading] = useState(false);

  // Example: Any window/document access must be guarded or in useEffect
  useEffect(() => {
    // Safe — runs only in browser
    if (typeof window !== 'undefined') {
      // Example: localStorage, window.location, etc.
      console.log('Browser-only code here');
    }
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Your checkout logic...
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-teal-900 mb-12 text-center">
          Buy CentralCore EMR License
        </h1>

        {/* Your pricing cards, quantity selector, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter, Pro, Lifetime cards */}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-12 bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl mx-auto block"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}