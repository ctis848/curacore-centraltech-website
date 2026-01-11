// app/buy/page.tsx
'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  paystackProduct?: string;
  userLimit: number | string;
}

export default function BuyPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('starter');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 11000,
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
      price: 22000,
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
      price: 578550,
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

  const handleProceed = async () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-paystack-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan.id,
          quantity,
          amount: selectedPlan.price * quantity,
          currency: selectedPlan.currency,
          productName: selectedPlan.paystackProduct || selectedPlan.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Payment server error (${response.status})`);
      }

      const data = await response.json();

      if (data.authorization_url && typeof data.authorization_url === 'string') {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No valid authorization URL received from server');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'An unknown error occurred during payment initiation';
      alert(`Error connecting to payment: ${message}`);
      console.error('Payment initiation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl text-red-600 font-black text-center mb-8">TEST BUILD - CHANGES ARE LIVE NOW</h2>
        <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-6 text-center">
          Buy CentralCore EMR License
        </h1>

        <p className="text-xl text-gray-700 mb-12 text-center max-w-4xl mx-auto">
          All plans include <strong>full access</strong> to every CentralCore EMR feature.  
          The only difference is the maximum number of users (seats/licenses).  
          Upgrade anytime for more users — no feature restrictions!
        </p>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`p-8 rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 border-4 flex flex-col ${
                selectedPlanId === p.id
                  ? 'border-yellow-400 bg-white scale-105'
                  : 'border-transparent bg-white/80 hover:scale-105'
              }`}
            >
              <h3 className="text-3xl font-bold text-teal-900 mb-4">{p.name}</h3>
              <p className="text-4xl font-black text-yellow-600 mb-2">
                ₦{p.price.toLocaleString()} {p.currency}
                {p.id !== 'enterprise' && <span className="text-xl font-normal">/month</span>}
              </p>
              <p className="text-lg font-medium text-teal-700 mb-6">
                {p.userLimit === 'Unlimited' ? 'Unlimited Users' : `Max ${p.userLimit} Users`}
              </p>
              <p className="text-gray-600 mb-6 italic flex-grow">{p.description}</p>
              <ul className="space-y-3 text-gray-700 mt-auto">
                {p.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
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
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="bg-teal-700 text-white w-12 h-12 rounded-full text-2xl font-bold hover:bg-teal-800 transition"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-4xl font-black text-teal-900 w-16 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="bg-teal-700 text-white w-12 h-12 rounded-full text-2xl font-bold hover:bg-teal-800 transition"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Total & Proceed */}
        <div className="text-center">
          {selectedPlan && (
            <p className="text-3xl font-bold text-teal-900 mb-6">
              Total: ₦{(selectedPlan.price * quantity).toLocaleString()} {selectedPlan.currency}
            </p>
          )}

          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoading || !selectedPlan}
            className={`bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold transition shadow-2xl mx-auto block ${
              isLoading || !selectedPlan ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-300'
            }`}
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