"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { PaymentRow } from "@/types/admin";

interface PageProps {
  params: { id: string };
}

export default function PaymentDetails({ params }: PageProps) {
  const supabase = supabaseBrowser();
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id;

  useEffect(() => {
    loadPayment();
  }, []);

  async function loadPayment() {
    const { data } = await supabase
      .from("Payment")
      .select("*")
      .eq("id", id)
      .single();

    setPayment(data);
    setLoading(false);
  }

  async function markPaid() {
    const res = await fetch(`/api/admin/payments/${id}/mark-paid`, {
      method: "POST",
    });

    const json = await res.json();
    alert(json.message);

    if (json.success) loadPayment();
  }

  if (loading) return <p>Loading...</p>;
  if (!payment) return <p>Payment not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Payment Details</h1>

      <div className="bg-white border rounded p-4 space-y-2">
        <p><strong>Description:</strong> {payment.description}</p>
        <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
        <p><strong>Status:</strong> {payment.status}</p>
        <p><strong>Created At:</strong> {payment.createdAt}</p>
        <p><strong>Paid At:</strong> {payment.paidAt}</p>
      </div>

      {payment.status === "PENDING" && (
        <button
          onClick={markPaid}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Mark as Paid
        </button>
      )}
    </div>
  );
}
