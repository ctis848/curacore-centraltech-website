"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCouponPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [expires, setExpires] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) return alert("Coupon code is required");
    if (!value || Number(value) <= 0) return alert("Discount value must be greater than 0");
    if (!expires) return alert("Expiry date is required");
    if (!maxUses || Number(maxUses) <= 0) return alert("Max uses must be greater than 0");

    setLoading(true);

    const res = await fetch("/api/coupons/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        expires,
        max_uses: Number(maxUses),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      alert(data.message || "Failed to create coupon");
      return;
    }

    alert("Coupon created successfully");
    router.push("/admin/coupons");
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Coupon</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Coupon Code */}
        <div>
          <label className="block mb-1 font-semibold">Coupon Code</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="E.g. CENTRAL10"
            required
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="block mb-1 font-semibold">Discount Type</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₦)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block mb-1 font-semibold">Discount Value</label>
          <input
            type="number"
            className="border px-3 py-2 rounded w-full"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "percentage" ? "E.g. 10" : "E.g. 5000"}
            required
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block mb-1 font-semibold">Expiry Date</label>
          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            required
          />
        </div>

        {/* Max Uses */}
        <div>
          <label className="block mb-1 font-semibold">Max Uses</label>
          <input
            type="number"
            className="border px-3 py-2 rounded w-full"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="E.g. 100"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-teal-600 text-white px-6 py-3 rounded font-semibold ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-700"
          }`}
        >
          {loading ? "Creating..." : "Create Coupon"}
        </button>
      </form>
    </div>
  );
}
