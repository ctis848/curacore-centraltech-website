import React from "react";
import { ClientPayment } from "@/app/client/payments/page";

interface Props {
  payments: ClientPayment[];
  onSelect: (p: ClientPayment) => void;
}

export default function PaymentList({ payments, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div
          key={p.id}
          className="border rounded p-4 bg-white shadow-sm cursor-pointer hover:bg-slate-50"
          onClick={() => onSelect(p)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-lg">₦{Number(p.amount).toLocaleString()}</p>
              <p className="text-sm text-slate-600">
                Reference: <span className="font-mono">{p.reference}</span>
              </p>
            </div>

            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                (p.status || "").toLowerCase() === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {p.status}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            {p.created_at ? new Date(p.created_at).toLocaleString() : "Unknown"}
          </p>
        </div>
      ))}
    </div>
  );
}
