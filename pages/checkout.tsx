import { useState } from "react";

export default function Checkout() {
  const originalAmount = 50000; // Example price

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(originalAmount);

  const applyCoupon = async () => {
    const res = await fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, amount: originalAmount }),
    });

    const data = await res.json();

    if (!data.valid) {
      alert(data.message);
      return;
    }

    setDiscount(data.discountAmount);
    setFinalAmount(data.newTotal);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <p className="text-lg mb-4">
        Original Price: ₦{originalAmount.toLocaleString()}
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter coupon"
          className="border px-3 py-2 rounded w-full"
          onChange={(e) => setCoupon(e.target.value)}
        />
        <button
          onClick={applyCoupon}
          className="bg-teal-600 text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      </div>

      <p className="text-gray-700">Discount: ₦{discount.toLocaleString()}</p>

      <p className="text-2xl font-bold mt-2">
        Final Amount: ₦{finalAmount.toLocaleString()}
      </p>

      {/* Paystack button will use finalAmount */}
    </div>
  );
}
