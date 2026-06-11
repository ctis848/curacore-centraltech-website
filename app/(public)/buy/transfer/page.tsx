"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function TransferPaymentPage() {
  // TS FIX: Always defined, so cast as URLSearchParams
  const params = useSearchParams() as URLSearchParams;

  const plan = params.get("plan") ?? "unknown";
  const amount = params.get("amount") ?? "0";
  const licenses = params.get("licenses") ?? "1";
  const email = params.get("email") ?? "";
  const company = params.get("company") ?? "";

  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitProof() {
    if (!proof) {
      alert("Please upload proof of payment.");
      return;
    }

    setSubmitting(true);

    const form = new FormData();
    form.append("proof", proof);
    form.append("plan", plan);
    form.append("amount", amount);
    form.append("licenses", licenses);
    form.append("email", email);
    form.append("company", company);

    const res = await fetch("/api/transfer/confirm", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setSubmitting(false);

    alert(json.message || "Submitted.");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Pay by Bank Transfer
      </h1>

      {/* Bank Details */}
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6 space-y-4">
        <p className="text-lg font-semibold">Bank Transfer Details</p>

        <div className="space-y-2 text-gray-700">
          <p><strong>Bank:</strong> First Bank Nigeria</p>
          <p><strong>Account Number:</strong> 2022362320</p>
          <p><strong>Account Name:</strong> Central Tech Information System Ltd</p>
        </div>

        <hr />

        <p><strong>Plan:</strong> {plan.toUpperCase()}</p>
        <p><strong>Licenses:</strong> {licenses}</p>

        <p className="text-xl font-bold text-green-700">
          Amount: ₦{Number(amount).toLocaleString()}
        </p>

        <p className="text-sm text-slate-600">
          After making the transfer, upload your proof of payment below.
          We will verify and activate your license.
        </p>
      </div>

      {/* Upload Proof */}
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200 p-6 space-y-4">
        <p className="font-semibold">Upload Proof of Payment</p>

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
          className="border p-3 rounded-lg w-full"
        />

        <button
          onClick={submitProof}
          disabled={submitting}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Payment Proof"}
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500">
        Your license will be activated once payment is confirmed.
      </p>
    </div>
  );
}
