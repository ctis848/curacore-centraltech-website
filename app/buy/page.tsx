// app/buy/page.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// THIS LINE IS THE OFFICIAL WINNING FIX
import type { Stripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P'
);

export default function BuyLicense() {
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (priceId: string, plan: string) => {
    setLoading(plan);
    const stripe = (await stripePromise) as Stripe | null;

    if (!stripe) {
      alert('Stripe failed to load');
      setLoading(null);
      return;
    }

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
        <h1 className="text-