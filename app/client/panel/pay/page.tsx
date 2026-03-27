"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientPaymentPortal() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/client/payments", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setInvoices(d.invoices || []));
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Payment Portal</h1>

      {invoices.length === 0 && (
        <p className="text-gray-600">You have no unpaid invoices.</p>
      )}

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-4 bg-white border rounded-lg shadow">
            <p className="font-semibold">${inv.amount}</p>
            <p className="text-sm text-gray-600">{inv.description}</p>
            <p className="text-xs text-gray-500">
              Created: {new Date(inv.createdAt).toLocaleString()}
            </p>

            <button
              onClick={() => window.location.href = `/api/client/payments/pay/${inv.id}`}
              className="mt-3 px-4 py-2 bg-teal-700 text-white rounded-lg"
            >
              Pay Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
