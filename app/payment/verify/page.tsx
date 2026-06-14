"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function PaymentVerifyContent() {
  const params = useSearchParams();
  const reference = params?.get("reference") ?? null;

  useEffect(() => {
    if (!reference) {
      window.location.href = "/payment/failed";
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await res.json();

        // Backend confirms success
        if (data?.success && data?.status === "success") {
          window.location.href = "/client/dashboard";
          return;
        }

        // Pending → retry page
        if (data?.status === "pending") {
          window.location.href = `/payment/status?reference=${reference}`;
          return;
        }

        // Anything else → failed
        window.location.href = `/payment/failed?reference=${reference}`;
      } catch (err) {
        console.error("VERIFY PAGE ERROR:", err);
        window.location.href = `/payment/failed?reference=${reference}`;
      }
    }

    verify();
  }, [reference]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
      <h1 className="text-2xl font-bold mb-4 text-teal-600">
        Verifying Payment…
      </h1>

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
