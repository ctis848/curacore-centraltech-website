"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServicePaymentCallback() {
  const params = useSearchParams()!;
  const reference = params.get("reference") ?? "";

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/service-request/payment-status?reference=${reference}`);
      const json = await res.json();
      if (res.ok) setStatus(json.status);
      else setStatus("failed");
    })();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg text-center">

        {status === "checking" && (
          <h1 className="text-3xl font-bold text-slate-600">Verifying Payment...</h1>
        )}

        {status === "success" && (
          <>
            <h1 className="text-4xl font-extrabold text-green-600">Payment Successful</h1>
            <p className="mt-4 text-lg">Your service invoice has been paid.</p>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="text-4xl font-extrabold text-red-600">Payment Failed</h1>
            <p className="mt-4 text-lg">Please try again or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}
