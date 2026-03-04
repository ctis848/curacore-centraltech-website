"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const reference = params.get("reference");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 text-center space-y-4">

        <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
          Payment Successful
        </h1>

        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          Your payment has been completed successfully.  
          Your license will be activated shortly.
        </p>

        {reference && (
          <p className="text-xs sm:text-sm text-gray-500">
            Reference: <span className="font-medium">{reference}</span>
          </p>
        )}

        <a
          href="/dashboard"
          className="block w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-teal-800 transition"
        >
          Go to Dashboard
        </a>
      </div>
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
