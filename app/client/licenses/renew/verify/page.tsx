"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function VerifyRenewalPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();

  // ⭐ FIX: Safe access
  const reference = params?.get("reference") ?? null;

  const [status, setStatus] = useState("Verifying payment…");

  useEffect(() => {
    if (reference) verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const res = await fetch("/api/paystack/verify?reference=" + reference);
      const data = await res.json();

      if (!data.status) {
        setStatus("Payment verification failed.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("User not found. Please log in again.");
        return;
      }

      await supabase.rpc("renew_all_licenses", {
        userid: user.id,
      });

      setStatus("Payment successful! Licenses renewed.");
    } catch (err) {
      setStatus("Verification error.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        License Renewal Status
      </h1>

      <p>{status}</p>

      <button
        onClick={() => router.push("/client/licenses")}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Go to Licenses
      </button>
    </div>
  );
}
