"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPayment() {
  const search = useSearchParams();
  const router = useRouter();

  const reference = search?.get("reference") ?? "";
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    if (!reference) {
      setStatus("Invalid payment reference");
      return;
    }

    (async () => {
      const res = await fetch(`/api/paystack/verify?reference=${reference}`);
      const json = await res.json();

      if (json.status === "success") {
        setStatus("Payment successful! Redirecting...");
        setTimeout(() => {
          router.push(`/admin/service-requests/${json.invoiceId}/invoice`);
        }, 2000);
      } else {
        setStatus("Payment failed or incomplete.");
      }
    })();
  }, [reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xl">
      {status}
    </div>
  );
}
