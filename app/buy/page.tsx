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

  // Map plan → amount
  function getAmount() {
    if (plan === 'starter') return 10000;
    if (plan === 'pro') return 20000;
    return 350999; // enterprise
  }

  // Handle Paystack payment
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
    <div className="min-h-screen flex flex-col bg-gray-50 px-6 md:px-10">

      <div className="max-w-4xl mx-auto py-24 space-y-16">

        <h1 className="text-5xl md:text-6xl font-black text-teal-800 text-center">
          Buy CentralCore EMR License
        </h1>

        <p className="text-center text-gray-700 text-xl max-w-2xl mx-auto">
          Complete your purchase securely.
        </p>

        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 space-y-10">

          {/* SELECT LICENSE */}
          <div className="space-y-6">
            <label className="block text-teal-800 font-semibold">Select License</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            >
              <option value="starter">Starter — ₦10,000 (One‑Time)</option>
              <option value="pro">Pro — ₦20,000 (One‑Time)</option>
              <option value="enterprise">Enterprise — ₦350,999 (One‑Time)</option>
            </select>
          </div>

          {/* FULL NAME */}
          <div className="space-y-6">
            <label className="block text-teal-800 font-semibold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-6">
            <label className="block text-teal-800 font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>

        <p className="text-center text-gray-700">
          Need help?{" "}
          <a href="/contact" className="text-teal-700 font-semibold hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
