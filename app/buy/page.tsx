// app/buy/page.tsx
'use client';

import { useState } from 'react';

export default function BuyPage() {
  const [plan, setPlan] = useState('starter');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 15, // USD per month
      currency: 'USD',
      description: 'Basic EMR features for small clinics',
      features: ['Patient Records', 'Appointments', 'Basic Billing', '1 User'],
      paystackProduct: 'CentralTechCore-Starter',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 30, // USD per month
      currency: 'USD',
      description: 'Advanced features for medium hospitals',
      features: ['All Starter + Lab Integration', 'Pharmacy Module', 'CCTV Monitoring', 'Up to 10 Users'],
      paystackProduct: 'CentralTechCore-Pro',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 750, // USD one-time
      currency: 'USD',
      description: 'Unlimited access + annual support',
      features: ['All Pro + Unlimited Users', 'Custom Integration', 'Priority Support', '20% Annual Support'],
      paystackProduct: 'CentralTechCore-Enterprise',
    },
  ];

  const selectedPlan = plans.find((p) => p.id === plan);

  const handleProceed = async () => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      const response = await fetch('/api/create-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan.id,
          quantity,
          amount: selectedPlan.price * quantity, // in USD dollars (Paystack will convert)
          currency: 'USD',
          productName: selectedPlan.paystackProduct,
        }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Failed to start payment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error connecting to payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-12 text-center">
          Buy CentralCore EMR License
        </h1>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`p-8 rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 border-4 ${
                plan === p.id
                  ? 'border-yellow-400 bg-white scale-105'
                  : 'border-transparent bg-white/80 hover:scale-105'
              }`}
            >
              <h3 className="text-3xl font-bold text-teal-900 mb-4">{p.name}</h3>
              <p className="text-4xl font-black text-yellow-600 mb-6">
                ${p.price.toLocaleString()} {p.currency}
                {p.id !== 'enterprise' && <span className="text-xl font-normal">/month</span>}
                {p.id === 'enterprise' && <span className="text-xl font-normal"> one-time</span>}
              </p>
              <p className="text-gray-700 mb-6">{p.description}</p>
              <ul className="space-y-3 text-gray-700">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quantity Selector */}
        <div className="max-w-md mx-auto text-center mb-12">
          <label className="block text-xl font-bold text-teal-900 mb-4">
            Number of Licenses / Users
          </label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-teal-700 text-white w-12 h-12 rounded-full text-2xl font-bold hover:bg-teal-800 transition"
            >
              -
            </button>
            <span className="text-4xl font-black text-teal-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-teal-700 text-white w-12 h-12 rounded-full text-2xl font-bold hover:bg-teal-800 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Total & Proceed */}
        <div className="text-center">
          {selectedPlan && (
            <p className="text-3xl font-bold text-teal-900 mb-6">
              Total: ${ (selectedPlan.price * quantity).toLocaleString() } {selectedPlan.currency}
            </p>
          )}
          <button
            onClick={handleProceed}
            disabled={loading || !selectedPlan}
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl disabled:opacity-50 mx-auto block"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-8 text-lg">
          Secure payment powered by Paystack • Any card worldwide • Auto currency conversion
        </p>
      </div>
    </div>
  );
}