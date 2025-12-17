// app/buy/page.tsx
'use client';

import { useState } from 'react';

export default function BuyLicense() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { url } = await res.json();

    if (url) {
      window.location.href = url;
    } else {
      alert('Checkout failed');
    }

    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-blue-900 mb-8">
          Get CuraCore EMR Today
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">

          <div className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition-all">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Starter</h2>
            <p className="text-6xl font-bold text-gray-900 mb-2">$11<span className="text-2xl font-normal">/month</span></p>
            <button
              onClick={() => handleCheckout('price_1SaN5sECEzFismm5enqBvUCk')}
              disabled={!!loading}
              className="w-full mt-8 bg-blue-900 text-white py-5 rounded-xl text-xl font-bold hover:bg-blue-800 disabled:opacity-60"
            >
              {loading === 'price_1SaN5sECEzFismm5enqBvUCk' ? 'Loading...' : 'Buy Starter'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-3xl shadow-2xl p-12 transform scale-110 border-8 border-yellow-400 relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-10 py-3 rounded-full text-xl font-black">
              MOST POPULAR
            </div>
            <h2 className="text-4xl font-bold mb-4">Pro</h2>
            <p className="text-7xl font-bold mb-2">$15<span className="text-3xl font-normal">/month</span></p>
            <button
              onClick={() => handleCheckout('price_1SaNH7ECEzFismm5X0PzxHOT')}
              disabled={!!loading}
              className="w-full mt-10 bg-white text-blue-900 py-6 rounded-xl text-2xl font-bold hover:bg-gray-100 disabled:opacity-60"
            >
              {loading === 'price_1SaNH7ECEzFismm5X0PzxHOT' ? 'Loading...' : 'Buy Pro Now'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition-all">
            <h2 className="text-3xl font-bold mb-4">Lifetime Deal</h2>
            <p className="text-6xl font-bold mb-2">$399<span className="text-2xl font-normal"> one-time</span></p>
            <button
              onClick={() => handleCheckout('price_1SaNJmECEzFismm5fDBhO46P')}
              disabled={!!loading}
              className="w-full mt-10 bg-yellow-400 text-blue-900 py-6 rounded-xl text-xl font-bold hover:bg-yellow-300 disabled:opacity-60"
            >
              {loading === 'price_1SaNJmECEzFismm5fDBhO46P' ? 'Loading...' : 'Buy Lifetime Access'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}