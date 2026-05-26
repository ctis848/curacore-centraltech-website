"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function PaymentPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);

    // Call backend to create Paystack transaction
    const res = await fetch(`/api/paystack/initiate?id=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error || "Unable to start payment");
      setLoading(false);
      return;
    }

    // Redirect user to Paystack checkout
    window.location.href = json.authorization_url;
  };

  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-3xl font-bold mb-6">Make Payment</h1>

      <p className="text-lg mb-6">
        You are about to make payment for Invoice ID: <strong>{id}</strong>
      </p>

      <button
        onClick={startPayment}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
      >
        {loading ? "Redirecting..." : "Proceed to Paystack"}
      </button>
    </div>
  );
}
