'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function BuyLicensePage() {
  const router = useRouter();

  const [plan, setPlan] = useState('starter');
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Hardcoded coupons (example)
  const coupons: Record<string, number> = {
    CENTRAL10: 10, // 10% off
    HOSPITAL20: 20, // 20% off
  };

  // Plan prices (in Naira)
  const planPrices: Record<string, number> = {
    starter: 100000,
    pro: 2500000,
    enterprise: 550000,
  };

  // VAT rate
  const VAT_RATE = 0.075; // 7.5%

  // Load logged-in user safely
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });

        let data = null;
        try {
          data = await res.json();
        } catch {
          setUser(null);
          setUserLoading(false);
          return;
        }

        if (data?.email) {
          setUser(data);
          setEmail(data.email);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }

      setUserLoading(false);
    }

    loadUser();
  }, []);

  // Base total
  const baseAmount = planPrices[plan] * quantity;

  // Discount
  const discountPercent = appliedCoupon?.discount ?? 0;
  const discountAmount = (baseAmount * discountPercent) / 100;

  // Subtotal after discount
  const subtotal = baseAmount - discountAmount;

  // VAT
  const vatAmount = subtotal * VAT_RATE;

  // Final total
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

  // License activation tracking after payment
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

  // Paystack inline popup
  async function handlePayment() {
    if (!fullName.trim() || !email.trim()) {
      alert('Please fill in full name and email');
      return;
    }

    if (!window.PaystackPop) {
      alert('Payment system not loaded. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // set in .env
        email,
        amount: Math.round(totalAmount) * 100, // kobo
        currency: 'NGN',
        ref: 'CENTRALCORE-' + Date.now(),
        metadata: {
          custom_fields: [
            {
              display_name: 'Full Name',
              variable_name: 'full_name',
              value: fullName,
            },
            {
              display_name: 'Plan',
              variable_name: 'plan',
              value: plan,
            },
            {
              display_name: 'Quantity',
              variable_name: 'quantity',
              value: quantity,
            },
          ],
        },
        callback: async (response: any) => {
          setLoading(false);
          await activateLicense(response.reference);
          alert('Payment successful! Reference: ' + response.reference);
          router.push('/client/client-panel');
        },
        onClose: () => {
          setLoading(false);
          alert('Payment window closed.');
        },
      });

      handler.openIframe();
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Error initializing payment.');
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
          {userLoading && (
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded-xl" />
              <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
          )}

          {!userLoading && (
            <>
              {/* Plan Selection */}
              <div className="space-y-4">
                <label className="block text-xl font-semibold text-gray-800">
                  Choose Plan
                </label>
                <select
                  value={plan}
                  onChange={(e) => {
                    setPlan(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="starter">Starter — ₦100,000 per license</option>
                  <option value="pro">Pro — ₦2,500,000 per license</option>
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
                    className="flex-1 p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-teal-700">
                    Applied <span className="font-semibold">{appliedCoupon.code}</span> — {appliedCoupon.discount}% off
                  </p>
                )}
                {couponError && (
                  <p className="text-sm text-red-600">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100 space-y-2">
                <div className="flex justify-between text-lg text-gray-700">
                  <span>Base ({quantity} × {formatNaira(planPrices[plan])})</span>
                  <span>{formatNaira(baseAmount)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-lg text-green-700">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-{formatNaira(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>

                <div className="flex justify-between text-lg text-gray-700">
                  <span>VAT (7.5%)</span>
                  <span>{formatNaira(vatAmount)}</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-2xl font-extrabold text-teal-800">
                  <span>Total</span>
                  <span>{formatNaira(totalAmount)}</span>
                </div>
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
                Secure payment powered by Paystack • Instant license activation after payment
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
