"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Coupon type
interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expires: string;
  max_uses: number;
  used: number;
  active: boolean;
  created_at: string;
}

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const couponId = params.id;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load coupon data
  const loadCoupon = async () => {
    const res = await fetch("/api/coupons/get", {
      method: "POST",
      body: JSON.stringify({ id: couponId }),
    });

    const json = await res.json();
    setCoupon(json.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupon();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon) return;

    setSaving(true);

    const res = await fetch("/api/coupons/update", {
      method: "POST",
      body: JSON.stringify({
        id: coupon.id,
        code: coupon.code.trim().toUpperCase(),
        type: coupon.type,
        value: coupon.value,
        expires: coupon.expires,
        max_uses: coupon.max_uses,
        active: coupon.active,
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      alert(json.message || "Failed to update coupon");
      return;
    }

    alert("Coupon updated successfully");
    router.push("/admin/coupons");
  };

  if (loading) {
    return <div className="p-10">Loading coupon...</div>;
  }

  if (!coupon) {
    return <div className="p-10 text-red-600">Coupon not found</div>;
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Coupon</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Coupon Code */}
        <div>
          <label className="block mb-1 font-semibold">Coupon Code</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full uppercase"
            value={coupon.code}
            onChange={(e) => setCoupon({ ...coupon, code: e.target.value })}
            required
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="block mb-1 font-semibold">Discount Type</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={coupon.type}
            onChange={(e) =>
              setCoupon({ ...coupon, type: e.target.value as "percentage" | "fixed" })
            }
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
            value={coupon.value}
            onChange={(e) =>
              setCoupon({ ...coupon, value: Number(e.target.value) })
            }
            required
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block mb-1 font-semibold">Expiry Date</label>
          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={coupon.expires}
            onChange={(e) =>
              setCoupon({ ...coupon, expires: e.target.value })
            }
            required
          />
        </div>

        {/* Max Uses */}
        <div>
          <label className="block mb-1 font-semibold">Max Uses</label>
          <input
            type="number"
            className="border px-3 py-2 rounded w-full"
            value={coupon.max_uses}
            onChange={(e) =>
              setCoupon({ ...coupon, max_uses: Number(e.target.value) })
            }
            required
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <label className="font-semibold">Active</label>
          <input
            type="checkbox"
            checked={coupon.active}
            onChange={(e) =>
              setCoupon({ ...coupon, active: e.target.checked })
            }
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className={`bg-teal-600 text-white px-6 py-3 rounded font-semibold ${
            saving ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-700"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
