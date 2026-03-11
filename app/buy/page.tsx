'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyLicensePage() {
  const router = useRouter();

  const [plan, setPlan] = useState('starter');
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data);
      if (data?.email) setEmail(data.email);
    }
    loadUser();
  }, []);

  // Plan prices (in Naira)
  const planPrices: Record<string, number> = {
    starter: 100000,
    pro: 2500000,
    enterprise: 550000,
  };

  // Calculate total amount
  const totalAmount = planPrices[plan] * quantity;

  // Format number with commas
  const formatNaira = (num: number) =>
    num.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });

  // Quantity controls
  const increaseQty = () => setQuantity((prev) => Math.min(prev + 1, 50));
  const decreaseQty = () => setQuantity((prev) => Math.max(prev - 1, 1));

  // Handle Paystack payment
  async function handlePayment() {
    if (!fullName.trim() || !email.trim()) {
      alert('Please fill in full name and email');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/create-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: totalAmount,
          plan,
          quantity,
          user_id: user?.id || null,
          fullName,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Payment initialization failed: ' + (data?.error || 'Unknown error'));
        console.log('Paystack error:', data);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Error connecting to payment server.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-500 p-8 md:p-12 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Buy CentralCore EMR License
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Secure your license(s) — multiple licenses supported
          </p>
        </div>

        {/* Form content */}
        <div className="p-8 md:p-12 lg:p-16 space-y-12">
          {/* Plan Selection */}
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800">
              Choose Plan
            </label>
            <select
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value);
                setQuantity(1); // reset quantity on plan change
              }}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="starter">Starter — ₦100,000 per license</option>
              <option value="pro">Pro — ₦250,000 per license</option>
              <option value="enterprise">Enterprise — ₦550,000 per license</option>
            </select>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800">
              Number of Licenses
            </label>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={decreaseQty}
                disabled={quantity <= 1}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold transition"
              >
                –
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 50) setQuantity(val);
                }}
                className="w-24 text-center text-3xl font-bold border border-gray-300 rounded-xl py-3 focus:ring-2 focus:ring-teal-500"
                min="1"
                max="50"
              />

              <button
                type="button"
                onClick={increaseQty}
                disabled={quantity >= 50}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold transition"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600">
              You can buy up to 50 licenses at once
            </p>
          </div>

          {/* Total Price Display */}
          <div className="bg-teal-50 p-8 rounded-2xl text-center border border-teal-100">
            <p className="text-xl text-gray-700 mb-2">Total Amount:</p>
            <p className="text-5xl md:text-6xl font-extrabold text-teal-800">
              {formatNaira(totalAmount)}
            </p>
            <p className="mt-3 text-lg text-gray-600">
              {quantity} × {formatNaira(planPrices[plan])} ({plan} plan)
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !fullName.trim() || !email.trim()}
            className={`w-full py-5 text-xl font-bold rounded-xl text-white transition-all transform hover:scale-[1.02] ${
              loading || !fullName.trim() || !email.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Processing...' : `Pay ${formatNaira(totalAmount)} Securely`}
          </button>

          <p className="text-center text-sm text-gray-600 pt-6">
            Secure payment powered by Paystack • Instant license delivery after payment
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to format Naira
function formatNaira(num: number) {
  return num.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
}