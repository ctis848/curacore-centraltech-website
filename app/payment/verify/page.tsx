"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentVerifyContent() {
  const params = useSearchParams();
  const reference = params.get("reference");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
      <h1 className="text-2xl font-bold mb-4 text-teal-600">Verifying Payment…</h1>

      {reference && (
        <p className="text-sm text-gray-600 mb-4">
          Reference: {reference}
        </p>
      )}

      <p className="text-gray-700">
        Please wait while we confirm your transaction.
      </p>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <PaymentVerifyContent />
    </Suspense>
  );
}
