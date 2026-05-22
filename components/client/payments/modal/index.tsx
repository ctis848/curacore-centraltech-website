import React from "react";
import { ClientPayment } from "@/app/client/payments/page";

interface Props {
  payment: ClientPayment | null;
  onClose: () => void;
}

export default function PaymentModal({ payment, onClose }: Props) {
  if (!payment) return null;

  const p = payment;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

        <div className="space-y-3 text-sm">
          <p><strong>Amount:</strong> ₦{Number(p.amount).toLocaleString()}</p>
          <p><strong>Status:</strong> {p.status}</p>
          <p><strong>Reference:</strong> {p.reference}</p>
          <p><strong>Invoice ID:</strong> {p.invoice_id || "—"}</p>
          <p>
            <strong>Date:</strong>{" "}
            {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
