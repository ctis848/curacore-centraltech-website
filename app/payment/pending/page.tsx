"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function PendingContent() {
  const params = useSearchParams();
  const reference = params?.get("reference") ?? null;

  return (
    <div className="max-w-md mx-auto mt-28 p-8 bg-white shadow-xl rounded-2xl text-center">

      {/* Icon */}
      <div className="text-yellow-500 text-6xl mb-4">⏳</div>

      <h1 className="text-3xl font-extrabold mb-3 text-yellow-600">
        Payment Pending
      </h1>

      <p className="text-gray-700 mb-4 leading-relaxed">
        Your payment is still being processed.  
        This usually happens when:
      </p>

      <ul className="text-left text-gray-600 text-sm space-y-2 mb-6">
        <li>• Bank transfer is still being confirmed</li>
        <li>• Paystack is verifying your transaction</li>
        <li>• Network delays occurred during checkout</li>
      </ul>

      {reference && (
        <p className="text-sm text-gray-500 mb-6">
          <strong>Reference:</strong>{" "}
          <span className="font-mono">{reference}</span>
        </p>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <a
          href={`/payment/success?reference=${reference ?? ""}`}
          className="block w-full bg-teal-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Refresh Payment Status
        </a>

        <a
          href="/buy"
          className="block w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Try Again
        </a>

        <a
          href="/"
          className="block w-full bg-slate-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
        >
          Return to Home
        </a>
      </div>

      {/* Support */}
      <p className="text-xs text-gray-500 mt-6">
        If your payment remains pending for more than 10 minutes,  
        please contact{" "}
        <a
          href="mailto:support@ctistech.com"
          className="text-blue-600 underline"
        >
          support@ctistech.com
        </a>
      </p>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-20">
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <PendingContent />
        </Suspense>
      </div>

      <Footer />
    </>
  );
}
