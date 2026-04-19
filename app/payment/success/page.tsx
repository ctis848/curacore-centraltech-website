"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentInfo {
  amount: number;
  reference: string;
  paidAt: string;
  licenseCount?: number;
}

function SuccessContent() {
  const params = useSearchParams();
  const reference = params.get("reference");

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!reference) {
        setError("Missing payment reference.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await res.json();

        if (!data.success) {
          setError("Unable to verify payment.");
          setLoading(false);
          return;
        }

        // Fetch renewal history entry (optional enhancement)
        const historyRes = await fetch("/api/my-history");
        const historyData = await historyRes.json();

        const latest = historyData?.find(
          (h: any) => h.reference === reference
        );

        setPayment({
          amount: latest?.amount || 0,
          reference,
          paidAt: latest?.paidAt || new Date().toISOString(),
          licenseCount: latest?.licenseCount,
        });
      } catch (err) {
        console.error(err);
        setError("Error loading payment details.");
      }

      setLoading(false);
    }

    load();
  }, [reference]);

  if (loading)
    return <div className="p-6 text-center">Verifying payment…</div>;

  if (error)
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
        <h1 className="text-xl font-bold text-red-600 mb-3">Verification Failed</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <a
          href="/client/renew-annual"
          className="inline-block bg-slate-900 text-white px-4 py-2 rounded"
        >
          Try Again
        </a>
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl text-center">
      <h1 className="text-2xl font-bold mb-4 text-emerald-600">
        Payment Successful
      </h1>

      <p className="text-gray-700 mb-4">
        Your annual renewal payment has been verified successfully.
      </p>

      {payment && (
        <div className="text-left space-y-2 mb-4">
          <p>
            <strong>Amount:</strong>{" "}
            ₦{payment.amount.toLocaleString()}
          </p>

          {payment.licenseCount && (
            <p>
              <strong>Licenses Renewed:</strong> {payment.licenseCount}
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
        href="/client/renewal-history"
        className="inline-block bg-emerald-600 text-white px-4 py-2 rounded font-semibold hover:bg-emerald-700"
      >
        View Renewal History
      </a>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
