"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function PayInvoicePage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/paystack/initiate?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        alert("Invalid server response from payment gateway.");
        setLoading(false);
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Unable to start payment");
        setLoading(false);
        return;
      }

      window.location.href = json.authorization_url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Network error starting payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-10 text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold">Make Payment</h1>
          <p className="opacity-90 mt-2 text-sm md:text-base">
            Invoice for Service Request ID: {id}
          </p>
        </div>

        <div className="p-10 space-y-6 text-slate-800">
          <p className="text-lg">
            You will be redirected to <span className="font-bold">Paystack</span> to
            complete this payment securely.
          </p>

          <p className="text-sm text-slate-500">
            After a successful payment, you’ll be redirected back and the invoice
            will be marked as <strong>PAID</strong>.
          </p>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Redirecting to Paystack..." : "Proceed to Paystack"}
          </button>
        </div>
      </div>
    </div>
  );
}
