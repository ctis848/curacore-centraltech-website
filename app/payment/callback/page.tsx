"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();

  // ⭐ Extract once, safely
  const reference = params?.get("reference") ?? null;

  const [message, setMessage] = useState("Verifying payment…");

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setMessage("Missing payment reference.");
        router.replace("/payment/failed");
        return;
      }

      try {
        setMessage("Contacting payment server…");

        const res = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          setMessage("Payment verified. Redirecting…");
          router.replace(`/payment/success?reference=${reference}`);
        } else {
          setMessage("Verification failed. Redirecting…");
          router.replace(`/payment/failed?reference=${reference}`);
        }
      } catch (err) {
        console.error("Callback error:", err);
        setMessage("Network error. Redirecting…");
        router.replace(`/payment/failed?reference=${reference}`);
      }
    }

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-semibold">Processing Payment…</h1>
      <p className="text-slate-600 mt-2">{message}</p>
    </div>
  );
}
