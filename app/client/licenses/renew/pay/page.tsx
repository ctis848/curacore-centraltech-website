"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function PaystackRenewalPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();

  const amount = Number(params.get("amount")) || 0;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/client/login");
      return;
    }

    setEmail(user.email || "");
    setLoading(false);
  };

  const startPayment = () => {
    if (!email || amount <= 0) return;

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Paystack uses kobo
      currency: "NGN",
      callback: async (response: any) => {
        await router.push(
          `/client/licenses/renew/verify?reference=${response.reference}`
        );
      },
      onClose: () => {
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        Pay for License Renewal
      </h1>

      <p className="text-sm text-slate-600">
        You are renewing all active licenses.
      </p>

      <div className="rounded border p-4 bg-green-50">
        <h2 className="font-semibold mb-2">Amount to Pay</h2>
        <p className="text-lg font-bold text-green-700">
          ₦{amount.toLocaleString()}
        </p>
      </div>

      <button
        onClick={startPayment}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Pay with Paystack
      </button>

      <script src="https://js.paystack.co/v1/inline.js"></script>
    </div>
  );
}
