'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyLicensePage() {
  const router = useRouter();

  const [plan, setPlan] = useState('starter');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data);
      if (data?.email) setEmail(data.email);
    }
    loadUser();
  }, []);

  function getAmount() {
    if (plan === 'starter') return 10000;
    if (plan === 'pro') return 20000;
    return 350999;
  }

  async function handlePayment() {
    try {
      setLoading(true);

      const res = await fetch('/api/create-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: getAmount(),
          plan,
          user_id: user?.id || null,
          fullName,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Payment initialization failed.');
        console.log('Paystack error:', data);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Error connecting to payment server.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-4 sm:px-6 md:px-10">

      <div className="max-w-3xl mx-auto py-16 sm:py-20 space-y-12 sm:space-y-16">

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-teal-800 text-center leading-tight">
          Buy CentralCore EMR License
        </h1>

        <p className="text-center text-gray-700 text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Complete your purchase securely.
        </p>

        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg border border-teal-200 space-y-8">

          {/* SELECT LICENSE */}
          <div className="space-y-3">
            <label className="block text-teal-800 font-semibold text-sm sm:text-base">Select License</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
            >
              <option value="starter">Starter — ₦10,000 (One‑Time)</option>
              <option value="pro">Pro — ₦20,000 (One‑Time)</option>
              <option value="enterprise">Enterprise — ₦350,999 (One‑Time)</option>
            </select>
          </div>

          {/* FULL NAME */}
          <div className="space-y-3">
            <label className="block text-teal-800 font-semibold text-sm sm:text-base">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-3">
            <label className="block text-teal-800 font-semibold text-sm sm:text-base">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600 text-sm sm:text-base"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-teal-800 transition"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>

        <p className="text-center text-gray-700 text-sm sm:text-base">
          Need help?{" "}
          <a href="/contact" className="text-teal-700 font-semibold hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
