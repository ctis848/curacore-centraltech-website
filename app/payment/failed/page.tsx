"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentFailedContent() {
  const params = useSearchParams();
  const reference = params.get("reference");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h1>

      <p className="text-gray-700 mb-4">
        Unfortunately, your payment could not be completed.
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
        Try Again
      </a>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
