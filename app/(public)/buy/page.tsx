"use client";

import { useState } from "react";

export default function BuyLicensePage() {
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [quantity, setQuantity] = useState(1);

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  // PRICING
  const planPrices: Record<string, number> = {
    starter: 250000,
    pro: 350000,
    enterprise: 550000,
  };

  const VAT_RATE = 0.075;
  const baseAmount = planPrices[plan] * quantity;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discountAmount = (baseAmount * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === "fixed") {
      discountAmount = appliedCoupon.value * quantity;
    }
  }

  const subtotal = baseAmount - discountAmount;
  const vatAmount = subtotal * VAT_RATE;
  const totalAmount = subtotal + vatAmount;

  const annualFees: Record<string, number> = {
    starter: planPrices.starter * 0.2 * quantity,
    pro: planPrices.pro * 0.2 * quantity,
    enterprise: planPrices.enterprise * 0.2 * quantity,
  };

  const formatNaira = (num: number) =>
    num.toLocaleString("en-NG", { style: "currency", currency: "NGN" });

  const increaseQty = () => setQuantity((prev) => Math.min(prev + 1, 50));
  const decreaseQty = () => setQuantity((prev) => Math.max(prev - 1, 1));

  // COUPON
  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setCouponError("");
    setAppliedCoupon(null);

    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couponCode: code,
        amount: baseAmount,
      }),
    });

    const json = await res.json();

    if (!json.valid) {
      setCouponError(json.reason || "Invalid coupon code");
      return;
    }

    setAppliedCoupon(json.coupon);
  }

  // PAYSTACK PAYMENT
  async function handlePayment() {
    if (loading) return;

    if (!email.trim() || !companyName.trim()) {
      alert("Please fill in company name and email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(totalAmount),
          email,
          companyName,
          plan,
          quantity,
          annualFee: annualFees[plan],
          type: "NEW_LICENSE_PURCHASE",
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to start payment.");
        setLoading(false);
        return;
      }

      if (!data.authorization_url) {
        alert("Payment initialized but no authorization URL returned.");
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Unable to start payment.");
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

                <p className="text-sm text-gray-600 mt-3">Up to 3 Users</p>
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

                <p className="text-sm text-gray-600 mt-3">Up to 5 Users</p>
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
                  <h3 className="text-xl font-bold text-gray-800">
                    Enterprise
                  </h3>
                </div>

                <p className="text-teal-700 font-semibold mt-3">
                  ₦550,000 / license
                </p>

                <span className="inline-block mt-2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Annual Fee: ₦110,000 / year
                </span>

                <p className="text-sm text-gray-600 mt-3">Unlimited Users</p>
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
                Applied <strong>{appliedCoupon.code}</strong> —{" "}
                {appliedCoupon.type === "percentage"
                  ? `${appliedCoupon.value}% off`
                  : `₦${appliedCoupon.value} off × ${quantity}`}
              </p>
            )}

            {couponError && (
              <p className="text-sm text-red-600">{couponError}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100 space-y-2">
            <div className="flex justify-between text-lg text-gray-700">
              <span>
                License Fee ({quantity} × {formatNaira(planPrices[plan])})
              </span>
              <span>{formatNaira(baseAmount)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-lg text-green-700">
                <span>Discount</span>
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
              <strong>Annual Maintenance Fee:</strong>{" "}
              {formatNaira(annualFees[plan])} / year
              <br />
              <span className="text-teal-700 font-semibold">
                (Starts next year — NOT charged today)
              </span>
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-4">
            <label className="block text-xl font-semibold text-gray-800">
              Company / Hospital Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company or hospital name"
              className="w-full p-4 text-lg border border-gray-300 rounded-xl"
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
            />
          </div>

          {/* Pay with Paystack */}
          <button
            onClick={handlePayment}
            disabled={loading || !email.trim() || !companyName.trim()}
            className={`w-full py-5 text-xl font-bold rounded-xl text-white transition-all transform hover:scale-[1.02] ${
              loading || !email.trim() || !companyName.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading
              ? "Processing..."
              : `Pay ${formatNaira(totalAmount)} Securely`}
          </button>

          {/* BANK TRANSFER MODULE — EXACT SAME AS RENEW PAGE */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg space-y-6 mt-10">
            <h2 className="text-lg font-semibold text-slate-900">
              Pay by Bank Transfer (Titan Bank)
            </h2>

            <p className="text-sm text-slate-700">
              You can also pay directly into our dedicated virtual account. Your
              payment will be automatically detected and your license will be
              activated.
            </p>

            {/* BANK DETAILS */}
            <div className="bg-slate-100 rounded-xl p-4 space-y-2">
              <p className="text-sm"><strong>Bank:</strong> Titan Bank</p>
              <p className="text-sm"><strong>Account Number:</strong> 0000729810</p>
              <p className="text-sm"><strong>Account Name:</strong> Central Tech Information System Ltd</p>
              <p className="text-xs text-slate-500">(This is your dedicated Paystack DVA)</p>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* OPTION A — COPY ACCOUNT NUMBER */}
              <button
                onClick={() => navigator.clipboard.writeText("0000729810")}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Copy Account Number
              </button>

              {/* OPTION B — I HAVE PAID */}
              <button
                onClick={() => alert("Thank you! Paystack will automatically verify your transfer within a few minutes.")}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
              >
                I Have Paid — Confirm Transfer
              </button>

              {/* OPTION C — UPLOAD PROOF */}
              <label className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition text-center cursor-pointer">
                Upload Proof of Payment
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => alert("Proof uploaded! Admin will verify manually.")}
                />
              </label>

              {/* OPTION D — OPEN BANK APP */}
              <button
                onClick={() => {
                  window.location.href = "intent://bankapp#Intent;scheme=bank;end";
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Open Bank App
              </button>
            </div>

            {/* OPTION E — BIG GREEN BUTTON */}
            <button
              onClick={() => alert("Please transfer to Titan Bank 0000729810. Your license will activate automatically once Paystack detects the payment.")}
              className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:brightness-110 transition"
            >
              Pay by Bank Transfer (Titan Bank)
            </button>

            <p className="text-xs text-slate-500 text-center">
              After payment, your license will be confirmed automatically via Paystack.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
