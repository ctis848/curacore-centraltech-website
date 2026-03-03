"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const reference = params.get("reference");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
      <h1 className="text-2xl font-bold mb-4 text-teal-600">Payment Successful</h1>

      <p className="text-gray-700 mb-4">
        Your payment was completed successfully.
      </p>

      {reference && (
        <p className="text-sm text-gray-500 mb-4">
          Reference: {reference}
        </p>
      )}

      <a
        href="/dashboard/billing"
        className="inline-block bg-teal-600 text-white px-4 py-2 rounded font-semibold"
      >
        Continue
      </a>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
