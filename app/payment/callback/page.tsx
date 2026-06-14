"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"verifying" | "success" | "pending" | "failed">(
    "verifying"
  );
  const [reference, setReference] = useState<string | null>(null);

  const [existingUser, setExistingUser] = useState<boolean | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    const ref = params?.get("reference") ?? null;
    setReference(ref);

    if (!ref) {
      setStatus("failed");
      return;
    }

    verifyPayment(ref);
  }, [params]);

  async function verifyPayment(ref: string) {
    try {
      const res = await fetch(`/api/payments/verify?reference=${ref}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("failed");
        return;
      }

      if (data.status === "success") {
        setExistingUser(data.existingUser ?? null);
        setCustomerEmail(data.email ?? null);
        setStatus("success");
      } else if (data.status === "pending") {
        setStatus("pending");
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      setStatus("failed");
    }
  }

  async function downloadReceipt() {
    if (!reference) return;

    const res = await fetch(`/api/payments/receipt?reference=${reference}`);

    if (!res.ok) {
      alert("Receipt not available yet.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `CentralCore-Receipt-${reference}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  // -------------------------------
  // LOADING STATE
  // -------------------------------
  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-teal-600 border-solid"></div>
        <p className="mt-6 text-xl text-gray-700">Verifying your payment…</p>
      </div>
    );
  }

  // -------------------------------
  // PENDING STATE
  // -------------------------------
  if (status === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-yellow-600">
          Payment Pending
        </h1>
        <p className="mt-4 text-gray-700">
          Your payment is still being processed by Paystack.
        </p>

        <button
          onClick={() => reference && verifyPayment(reference)}
          className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
        >
          Refresh Status
        </button>
      </div>
    );
  }

  // -------------------------------
  // FAILED STATE
  // -------------------------------
  if (status === "failed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Payment Verification Failed
        </h1>
        <p className="mt-4 text-gray-700">We could not verify your payment.</p>

        <button
          onClick={() => reference && verifyPayment(reference)}
          className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
        >
          Retry Verification
        </button>

        <button
          onClick={() => router.push("/buy")}
          className="mt-4 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400"
        >
          Go Back
        </button>
      </div>
    );
  }

  // -------------------------------
  // SUCCESS STATE
  // -------------------------------
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center">
        <div className="bg-green-100 p-6 rounded-full">
          <svg
            className="w-20 h-20 text-green-600 animate-ping-slow"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-green-600 mt-6">
        Payment Successful
      </h1>
      <p className="mt-4 text-gray-700">Your payment has been received.</p>

      <button
        onClick={downloadReceipt}
        className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
      >
        Download Receipt
      </button>

      <button
        onClick={() => {
          if (existingUser) {
            router.push("/auth/client/login");
          } else {
            const emailParam = customerEmail ? `?email=${customerEmail}` : "";
            router.push(`/signup${emailParam}`);
          }
        }}
        className="mt-4 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400"
      >
        {existingUser ? "Go to Login" : "Complete Signup"}
      </button>
    </div>
  );
}
