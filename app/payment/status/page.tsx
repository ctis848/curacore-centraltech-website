"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type StatusType = "success" | "failed" | "pending";

interface PaymentInfo {
  amount: number;
  reference: string;
  paidAt: string;
  licenseCount?: number;
}

function StatusContent() {
  const params = useSearchParams();
  const reference = params?.get("reference") ?? null;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusType>("pending");
  const [payment, setPayment] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setStatus("failed");
        setLoading(false);
        return;
      }

      let attempts = 0;
      let finalStatus: StatusType = "pending";

      while (attempts < 5) {
        try {
          const res = await fetch(`/api/payments/verify?reference=${reference}`);
          const data = await res.json();

          // Backend confirms success
          if (data?.success && data?.status === "success") {
            finalStatus = "success";

            setPayment({
              amount: data.amount || 0,
              reference: data.reference || reference,
              paidAt: data.paidAt || new Date().toISOString(),
              licenseCount: data.licenseCount,
            });

            break;
          }

          // Backend says pending
          if (data?.status === "pending") {
            finalStatus = "pending";
          }

          // Backend says failed
          if (data?.status === "failed") {
            finalStatus = "failed";
            break;
          }
        } catch (err) {
          console.error("Verification error:", err);
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // After retries, use whatever finalStatus we ended with
      setStatus(finalStatus);
      setLoading(false);
    }

    verifyPayment();
  }, [reference]);

  if (loading)
    return (
      <div className="p-6 text-center text-lg font-medium">
        Checking payment status…
      </div>
    );

  // SUCCESS UI
  if (status === "success")
    return (
      <div className="max-w-md mx-auto mt-28 p-8 bg-white shadow-xl rounded-2xl text-center">
        <div className="text-emerald-600 text-6xl mb-4">✔</div>

        <h1 className="text-3xl font-extrabold mb-3 text-emerald-600">
          Payment Successful
        </h1>

        <p className="text-gray-700 mb-4">
          Your payment has been verified successfully.
        </p>

        {payment && (
          <div className="text-left space-y-2 mb-4">
            <p>
              <strong>Amount:</strong>{" "}
              ₦{payment.amount.toLocaleString()}
            </p>

            {payment.licenseCount && (
              <p>
                <strong>Licenses:</strong> {payment.licenseCount}
              </p>
            )}

            <p>
              <strong>Reference:</strong>{" "}
              <span className="font-mono">{payment.reference}</span>
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(payment.paidAt).toLocaleString()}
            </p>
          </div>
        )}

        <a
          href="/client/login"
          className="inline-block bg-emerald-600 text-white px-4 py-2 rounded font-semibold hover:bg-emerald-700"
        >
          Go to Client Login
        </a>
      </div>
    );

  // PENDING UI
  if (status === "pending")
    return (
      <div className="max-w-md mx-auto mt-28 p-8 bg-white shadow-xl rounded-2xl text-center">
        <div className="text-yellow-500 text-6xl mb-4">⏳</div>

        <h1 className="text-3xl font-extrabold mb-3 text-yellow-600">
          Payment Pending
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Your payment is still being processed.  
          This may take a few minutes.
        </p>

        {reference && (
          <p className="text-sm text-gray-500 mb-6">
            <strong>Reference:</strong>{" "}
            <span className="font-mono">{reference}</span>
          </p>
        )}

        <div className="space-y-3">
          <a
            href={`/payment/status?reference=${reference}`}
            className="block w-full bg-teal-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Refresh Status
          </a>

          <a
            href="/"
            className="block w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Return Home
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If pending for more than 10 minutes, contact{" "}
          <a
            href="mailto:support@ctistech.com"
            className="text-blue-600 underline"
          >
            support@ctistech.com
          </a>
        </p>
      </div>
    );

  // FAILED UI
  return (
    <div className="max-w-md mx-auto mt-28 p-8 bg-white shadow-xl rounded-2xl text-center">
      <div className="text-red-600 text-6xl mb-4">✖</div>

      <h1 className="text-3xl font-extrabold mb-3 text-red-600">
        Payment Failed
      </h1>

      <p className="text-gray-700 mb-4">
        We could not verify your payment.
      </p>

      {reference && (
        <p className="text-sm text-gray-500 mb-6">
          <strong>Reference:</strong>{" "}
          <span className="font-mono">{reference}</span>
        </p>
      )}

      <div className="space-y-3">
        <a
          href="/buy"
          className="block w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Try Again
        </a>

        <a
          href="/"
          className="block w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Return Home
        </a>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        If you were charged, contact{" "}
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

export default function PaymentStatusPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-20">
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <StatusContent />
        </Suspense>
      </div>

      <Footer />
    </>
  );
}
