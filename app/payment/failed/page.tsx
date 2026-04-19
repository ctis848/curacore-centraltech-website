"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FailedContent() {
  const params = useSearchParams();
  const reference = params.get("reference");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h1>

      <p className="text-gray-700 mb-4">
        We could not verify your payment.
      </p>

      {reference && (
        <p className="text-sm text-gray-500 mb-4">Reference: {reference}</p>
      )}

      <a
        href="/client/renew-annual"
        className="inline-block bg-red-600 text-white px-4 py-2 rounded font-semibold"
      >
        Try Again
      </a>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <FailedContent />
    </Suspense>
  );
}
