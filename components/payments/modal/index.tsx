"use client";

import React, { useState } from "react";
import { PaymentRow } from "@/app/admin/payments/page";

type Props = {
  open: boolean;
  payment: PaymentRow | null;
  onClose: () => void;
  onSaveNotes: (paymentId: string, notes: string) => Promise<void>;
};

export default function ViewPaymentModal({
  open,
  payment,
  onClose,
  onSaveNotes,
}: Props) {
  const [notes, setNotes] = useState(payment?.admin_notes ?? "");

  if (!open || !payment) return null;

  const p = payment;

  async function handleSave() {
    await onSaveNotes(p.id, notes);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
          Payment Details
        </h2>

        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong className="text-slate-900">Amount:</strong>{" "}
            ₦{Number(p.amount).toLocaleString()}
          </p>
          <p>
            <strong className="text-slate-900">Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                (p.status || "").toLowerCase() === "success"
                  ? "bg-green-100 text-green-700"
                  : (p.status || "").toLowerCase() === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {p.status || "UNKNOWN"}
            </span>
          </p>
          <p>
            <strong className="text-slate-900">Email:</strong>{" "}
            {p.email || "—"}
          </p>
          <p>
            <strong className="text-slate-900">Reference:</strong>{" "}
            {p.reference || "—"}
          </p>
          <p>
            <strong className="text-slate-900">Invoice ID:</strong>{" "}
            {p.invoice_id || "—"}
          </p>
          <p>
            <strong className="text-slate-900">Date:</strong>{" "}
            {p.created_at
              ? new Date(p.created_at).toLocaleString()
              : "—"}
          </p>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Admin Notes
          </label>
          <textarea
            className="w-full border rounded-lg p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-purple-400"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes about this payment..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold shadow hover:brightness-110"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
