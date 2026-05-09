'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyLicensePage() {
  const router = useRouter();

  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('starter');
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Coupons
  const coupons: Record<string, number> = {
    CENTRAL10: 10,
    HOSPITAL20: 20,
  };

  // Plan prices
  const planPrices: Record<string, number> = {
    starter: 250000,
    pro: 350000,
    enterprise: 550000,
  };

  // ⭐ Annual fee = 20% of license price × quantity
  const annualFees: Record<string, number> = {
    starter: planPrices.starter * 0.2 * quantity,
    pro: planPrices.pro * 0.2 * quantity,
    enterprise: planPrices.enterprise * 0.2 * quantity,
  };

  const VAT_RATE = 0.075;

  // Pricing calculations
  const baseAmount = planPrices[plan] * quantity;
  const discountPercent = appliedCoupon?.discount ?? 0;
  const discountAmount = (baseAmount * discountPercent) / 100;
  const subtotal = baseAmount - discountAmount;
  const vatAmount = subtotal * VAT_RATE;
  const totalAmount = subtotal + vatAmount;

  const formatNaira = (num: number) =>
    num.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });

  const increaseQty = () => setQuantity((prev) => Math.min(prev + 1, 50));
  const decreaseQty = () => setQuantity((prev) => Math.max(prev - 1, 1));

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (coupons[code]) {
      setAppliedCoupon({ code, discount: coupons[code] });
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid coupon code');
    }
  }

  async function activateLicense(reference: string) {
    try {
      await fetch('/api/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          plan,
          quantity,
          email,
          fullName,
        }),
      });
    } catch (err) {
      console.error('License activation error:', err);
    }
  }

  // ⭐ Redirect Paystack Checkout
  async function handlePayment() {
    if (!fullName.trim() || !email.trim()) {
      alert('Please fill in full name and email');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalAmount),
          email,
          plan,
          quantity,
          fullName,
          annualFee: annualFees[plan],

          // ⭐ REQUIRED FIELD — FIXES THE ERROR
          type: "NEW_LICENSE_PURCHASE",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        alert(data.error || 'Unable to start payment.');
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;

    } catch (err) {
      console.error('Payment error:', err);
      alert('Unable to start payment.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-500 p-8 md:p-12 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Buy CentralCore EMR License
          </h1>
          <p className="mt-4 text-lg opacity-90">
            One‑time license fee • Annual maintenance billed next year
          </p>
        </div>

        <div className="p-8 md:p-12 lg:p-16 space-y-12">

          {/* Plan Selection */}
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800">
              Choose Plan
            </label>

            <div className="grid md:grid-cols-3 gap-6">

              {/* Starter */}
              <div
                onClick={() => {
                  setPlan("starter");
                  setQuantity(1);
                }}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                  plan === "starter"
                    ? "border-teal-600 bg-teal-50 shadow-xl"
                    : "border-gray-300 hover:border-teal-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚀</span>
                  <h3 className="text-xl font-bold text-gray-800">Starter</h3>
                </div>

                <p className="text-teal-700 font-semibold mt-3">
                  ₦250,000 / license
                </p>

                <span className="inline-block mt-2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Annual Fee: ₦50,000 / year
                </span>

                <p className="text-sm text-gray-600 mt-3">
                  Up to 3 Users
                </p>
              </div>

              {/* Pro */}
              <div
                onClick={() => {
                  setPlan("pro");
                  setQuantity(1);
                }}
                className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                  plan === "pro"
                    ? "border-teal-600 bg-teal-50 shadow-xl"
                    : "border-gray-300 hover:border-teal-400"
                }`}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  MOST POPULAR
                </span>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl">💼</span>
                  <h3 className="text-xl font-bold text-gray-800">Pro</h3>
                </div>

                <p className="text-teal-700 font-semibold mt-3">
                  ₦350,000 / license
                </p>

                <span className="inline-block mt-2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Annual Fee: ₦70,000 / year
                </span>

                <p className="text-sm text-gray-600 mt-3">
                  Up to 5 Users
                </p>
              </div>

              {/* Enterprise */}
              <div
                onClick={() => {
                  setPlan("enterprise");
                  setQuantity(1);
                }}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                  plan === "enterprise"
                    ? "border-teal-600 bg-teal-50 shadow-xl"
                    : "border-gray-300 hover:border-teal-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏥</span>
                  <h3 className="text-xl font-bold text-gray-800">Enterprise</h3>
                </div>

                <p className="text-teal-700 font-semibold mt-3">
                  ₦550,000 / license
                </p>

                <span className="inline-block mt-2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Annual Fee: ₦110,000 / year
                </span>

                <p className="text-sm text-gray-600 mt-3">
                  Unlimited Users
                </p>
              </div>

            </div>
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
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-2xl font-bold"
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
                className="w-24 text-center text-3xl font-bold border border-gray-300 rounded-xl py-3"
                min="1"
                max="50"
              />

              <button
                type="button"
                onClick={increaseQty}
                disabled={quantity >= 50}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-2xl font-bold"
              >
                +
              </button>
            </div>

            <p className="text-sm text-gray-600">
              You can buy up to 50 licenses at once
            </p>
          </div>

          {/* Coupon */}
          <div className="space-y-3">
            <label className="block text-xl font-semibold text-gray-800">
              Coupon Code (optional)
            </label>

            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 p-4 text-lg border border-gray-300 rounded-xl"
              />

              <button
                type="button"
                onClick={applyCoupon}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <p className="text-sm text-teal-700">
                Applied <strong>{appliedCoupon.code}</strong> — {appliedCoupon.discount}% off
              </p>
            )}

            {couponError && (
              <p className="text-sm text-red-600">{couponError}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100 space-y-2">
            <div className="flex justify-between text-lg text-gray-700">
              <span>License Fee ({quantity} × {formatNaira(planPrices[plan])})</span>
              <span>{formatNaira(baseAmount)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-lg text-green-700">
                <span>Discount ({discountPercent}%)</span>
                <span>-{formatNaira(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg text-gray-700">
              <span>VAT (7.5%)</span>
              <span>{formatNaira(vatAmount)}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between text-2xl font-extrabold text-teal-800">
              <span>Total (Pay Now)</span>
              <span>{formatNaira(totalAmount)}</span>
            </div>

            <p className="text-sm text-gray-600 pt-2">
              <strong>Annual Maintenance Fee:</strong> {formatNaira(annualFees[plan])} / year  
              <br />
              <span className="text-teal-700 font-semibold">
                (Starts next year — NOT charged today)
              </span>
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
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
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
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
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
            Secure payment powered by Paystack • Instant license activation after payment
          </p>
        </div>
      </div>
    </div>
  );
}
