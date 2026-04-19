"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type InvoicePayRow = {
  id: string;
  amount: number;
  currency: string | null;
  status: string;
  email: string | null;
  userId: string;
};

export default function PayInvoicePage() {
  const supabase = supabaseBrowser();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<InvoicePayRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const invoiceId = params.id;
        if (!invoiceId) {
          setNotFound(true);
          return;
        }

        // Fetch invoice
        const { data, error } = await supabase
          .from("Invoice")
          .select("id,amount,currency,status,email,userId")
          .eq("id", invoiceId)
          .single();

        if (error || !data) {
          console.error("Invoice fetch error:", error);
          setNotFound(true);
          return;
        }

        // Protect route: ensure invoice belongs to logged‑in user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || user.id !== data.userId) {
          router.push("/auth/client/login");
          return;
        }

        setInvoice(data as InvoicePayRow);
      } catch (err) {
        console.error("Unexpected invoice error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id, router, supabase]);

  if (loading) {
    return <p className="text-slate-500">Loading invoice…</p>;
  }

  if (notFound || !invoice) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900">Invoice Not Found</h1>
        <p className="text-slate-600">This invoice does not exist or is not accessible.</p>
        <button
          onClick={() => router.push("/client/invoice-history")}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const handlePay = async () => {
    // Redirect to your payment provider (Flutterwave / Paystack / Stripe)
    window.location.href = `/api/payments/checkout?invoiceId=${invoice.id}`;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Pay Invoice</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
        <p className="font-medium">Invoice ID: {invoice.id}</p>

        <p>
          Amount:{" "}
          <span className="font-semibold">
            {invoice.currency || "₦"}{" "}
            {invoice.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </p>

        <p>
          Status:{" "}
          <span
            className={`font-semibold ${
              invoice.status === "PAID"
                ? "text-green-600"
                : invoice.status === "OVERDUE"
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {invoice.status}
          </span>
        </p>
      </div>

      {invoice.status === "PAID" ? (
        <p className="text-green-700 font-medium">This invoice is already paid.</p>
      ) : (
        <button
          onClick={handlePay}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Proceed to Payment
        </button>
      )}
    </div>
  );
}
