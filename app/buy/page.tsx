// app/buy/page.tsx
'use client';

import { useState } from 'react';

export default function BuyLicense() {
  const [loading, setLoading] = useState<string | null>(null);
  const [quantities, setQuantities] = useState({
    Starter: 1,
    Pro: 1,
    Lifetime: 1,
  });

  const handleQuantityChange = (plan: string, value: number) => {
    if (value >= 1) {
      setQuantities({ ...quantities, [plan]: value });
    }
  };

  const handleCheckout = async (priceId: string, planName: string) => {
    const quantity = quantities[planName as keyof typeof quantities];
    setLoading(planName);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, planName, quantity }),
    });
    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      alert('Checkout failed');
      setLoading(null);
    }
  };

  return (
    <>
      <section className="py-32 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black text-teal-900 mb-8 drop-shadow-lg">
            Get CuraCore EMR Today
          </h1>
          <p className="text-3xl text-teal-800 mb-20 max-w-4xl mx-auto">
            The #1 Hospital Information System in Africa — Secure, Powerful, Affordable
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Starter */}
            <div className="bg-white rounded-3xl shadow-2xl p-12 hover:scale-105 transition-all border border-teal-100">
              <h2 className="text-4xl font-bold text-teal-900 mb-6">Starter</h2>
              <p className="text-7xl font-black text-teal-900 mb-4">
                $11<span className="text-3xl font-normal">/month</span>
              </p>
              <div className="my-10 flex items-center justify-center gap-4">
                <label className="text-xl text-gray-700">Seats:</label>
                <input
                  type="number"
                  min="1"
                  value={quantities.Starter}
                  onChange={(e) => handleQuantityChange('Starter', parseInt(e.target.value) || 1)}
                  className="w-24 px-4 py-3 border-2 border-teal-200 rounded-xl text-center text-lg focus:border-teal-500"
                />
              </div>
              <button
                onClick={() => handleCheckout('price_1SaN5sECEzFismm5enqBvUCk', 'Starter')}
                disabled={!!loading}
                className="w-full bg-teal-800 text-white py-6 rounded-xl text-2xl font-bold hover:bg-teal-700 disabled:opacity-60 transition shadow-lg"
              >
                {loading === 'Starter' ? 'Loading...' : 'Buy Starter'}
              </button>
            </div>

            {/* Pro - Most Popular */}
            <div className="relative bg-gradient-to-br from-teal-900 to-teal-800 text-white rounded-3xl shadow-2xl p-16 transform scale-110 border-8 border-yellow-400">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-teal-900 px-12 py-4 rounded-full text-2xl font-black shadow-2xl">
                MOST POPULAR
              </div>
              <h2 className="text-5xl font-bold mb-8">Pro</h2>
              <p className="text-8xl font-black mb-6">
                $15<span className="text-4xl font-normal">/month</span>
              </p>
              <div className="my-12 flex items-center justify-center gap-4">
                <label className="text-2xl">Seats:</label>
                <input
                  type="number"
                  min="1"
                  value={quantities.Pro}
                  onChange={(e) => handleQuantityChange('Pro', parseInt(e.target.value) || 1)}
                  className="w-28 px-5 py-4 border-2 border-white rounded-xl text-center text-2xl bg-white/20 backdrop-blur"
                />
              </div>
              <button
                onClick={() => handleCheckout('price_1SaNH7ECEzFismm5X0PzxHOT', 'Pro')}
                disabled={!!loading}
                className="w-full bg-yellow-400 text-teal-900 py-7 rounded-xl text-3xl font-bold hover:bg-yellow-300 disabled:opacity-60 transition shadow-2xl"
              >
                {loading === 'Pro' ? 'Loading...' : 'Buy Pro Now'}
              </button>
            </div>

            {/* Lifetime */}
            <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-3xl shadow-2xl p-12 hover:scale-105 transition-all">
              <h2 className="text-4xl font-bold mb-6">Lifetime Deal</h2>
              <p className="text-7xl font-black mb-4">
                $399<span className="text-3xl font-normal"> one-time</span>
              </p>
              <div className="my-10 flex items-center justify-center gap-4">
                <label className="text-xl">Seats:</label>
                <input
                  type="number"
                  min="1"
                  value={quantities.Lifetime}
                  onChange={(e) => handleQuantityChange('Lifetime', parseInt(e.target.value) || 1)}
                  className="w-24 px-4 py-3 border-2 border-white/30 rounded-xl text-center text-lg bg-white/10"
                />
              </div>
              <button
                onClick={() => handleCheckout('price_1SaNJmECEzFismm5fDBhO46P', 'Lifetime')}
                disabled={!!loading}
                className="w-full bg-yellow-400 text-teal-900 py-6 rounded-xl text-2xl font-bold hover:bg-yellow-300 disabled:opacity-60 transition shadow-lg"
              >
                {loading === 'Lifetime' ? 'Loading...' : 'Buy Lifetime Access'}
              </button>
            </div>
          </div>

          <p className="mt-24 text-lg text-gray-600">
            Test mode • Use card: <code className="bg-gray-200 px-3 py-1 rounded">4242 4242 4242 4242</code>
          </p>
        </div>
      </section>
    </>
  );
}