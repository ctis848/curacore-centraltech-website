// app/buy/page.tsx
'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  description: string;
  features: string[];
  paystackProduct?: string;
  userLimit: number | string;
}

export default function BuyPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('starter');
  const [quantity, setQuantity] = useState<number>(1);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [email, setEmail] = useState<string>(''); // New: email input
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 11000,
      currency: 'NGN',
      description: 'Full access to all CentralCore EMR features — perfect for small clinics',
      features: [
        'Complete EMR: Patient Records, Appointments, Billing, Pharmacy, Lab, Radiology, Inventory, Wards, Nurses Module, Messaging, HL7, Reports & more',
        'All modules and integrations included',
        'Maximum 5 users (seats/licenses)',
      ],
      paystackProduct: 'CentralTechCore-Starter',
      userLimit: 5,
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 22000,
      currency: 'NGN',
      description: 'Full access to all CentralCore EMR features — ideal for growing hospitals',
      features: [
        'Complete EMR: Patient Records, Appointments, Billing, Pharmacy, Lab, Radiology, Inventory, Wards, Nurses Module, Messaging, HL7, Reports & more',
        'All modules and integrations included',
        'Maximum 25 users (seats/licenses)',
      ],
      paystackProduct: 'CentralTechCore-Pro',
      userLimit: 25,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceMonthly: 578550, // one-time
      currency: 'NGN',
      description: 'Full access to all CentralCore EMR features — for large institutions & networks',
      features: [
        'Complete EMR: Patient Records, Appointments, Billing, Pharmacy, Lab, Radiology, Inventory, Wards, Nurses Module, Messaging, HL7, Reports & more',
        'All modules and integrations included',
        'Unlimited users (seats/licenses)',
        '20% annual support fee included',
      ],
      paystackProduct: 'CentralTechCore-Enterprise',
      userLimit: 'Unlimited',
    },
  ];

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const getCurrentPrice = (p: Plan) => {
    if (billingPeriod === 'yearly' && p.id !== 'enterprise') {
      return Math.round(p.priceMonthly * 12 * 0.9); // 10% discount for yearly
    }
    return p.priceMonthly;
  };

  const handleProceed = async () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan.id,
          quantity,
          amount: getCurrentPrice(selectedPlan) * quantity,
          currency: selectedPlan.currency,
          productName: selectedPlan.paystackProduct || selectedPlan.name,
          email: email.trim(),           // ← Sending real email
          billingPeriod,                 // ← Sending monthly/yearly
        }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Failed to start payment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error occurred';
      alert(`Error connecting to payment: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-12 text-center">
          Buy CentralCore EMR License
        </h1>

        {/* Billing Period Switch */}
        <div className="text-center mb-8">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-3 rounded-l-full text-lg font-medium transition ${
              billingPeriod === 'monthly' ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-900 hover:bg-teal-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-3 rounded-r-full text-lg font-medium transition ${
              billingPeriod === 'yearly' ? 'bg-yellow-400 text-teal-900' : 'bg-teal-100 text-teal-900 hover:bg-teal-200'
            }`}
          >
            Yearly (10% off)
          </button>
        </div>

        {/* Email Input (new) */}
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-xl font-bold text-teal-900 mb-2">
            Your Email Address (required for payment)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-6 py-4 rounded-full border-2 border-teal-300 text-lg focus:border-yellow-400 outline-none"
            required
          />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`p-8 rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 border-4 ${
                selectedPlanId === p.id
                  ? 'border-yellow-400 bg-white scale-105'
                  : 'border-transparent bg-white/80 hover:scale-105'
              }`}
            >
              <h3 className="text-3xl font-bold text-teal-900 mb-4">{p.name}</h3>
              <p className="text-4xl font-black text-yellow-600 mb-6">
                ₦{getCurrentPrice(p).toLocaleString()} {p.currency}
                {p.id !== 'enterprise' && <span className="text-xl font-normal">/{billingPeriod}</span>}
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
              className="bg-teal-700 text-white w-12 h-12 rounded-full text-2xl font-bold hover:bg-teal-800"
            >
              -
            </button>
            <span className="text-4xl font-black text-teal-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-teal-700 text-white w-12 h-12 rounded-full text-2xl font-bold hover:bg-teal-800"
            >
              +
            </button>
          </div>
        </div>

        {/* Total & Proceed */}
        <div className="text-center">
          {selectedPlan && (
            <p className="text-3xl font-bold text-teal-900 mb-6">
              Total: ₦{(getCurrentPrice(selectedPlan) * quantity).toLocaleString()} {selectedPlan.currency}
            </p>
          )}
          <button
            onClick={handleProceed}
            disabled={isLoading || !selectedPlan || !email.trim()}
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl disabled:opacity-50 mx-auto block"
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-8 text-lg">
          Secure payment powered by Paystack • Any card worldwide • Auto currency conversion
        </p>
      </div>
    </div>
  );
}