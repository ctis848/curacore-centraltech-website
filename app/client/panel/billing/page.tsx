"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientBillingOverview() {
  const [billing, setBilling] = useState<any>(null);

  useEffect(() => {
    fetch("/api/client/billing", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => setBilling(d));
  }, []);

  if (!billing) {
    return <p className="p-6">Loading billing...</p>;
  }

  return (
    <div className="space-y-10 p-6">
      <h1 className="text-3xl font-bold">Billing Overview</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Current Balance" value={`$${billing.balance}`} />
        <SummaryCard title="Last Payment" value={billing.lastPayment || "N/A"} />
        <SummaryCard title="Next Renewal" value={billing.nextRenewal || "N/A"} />
      </div>

      {/* BILLING HISTORY */}
      <div className="p-6 bg-white border rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Billing History</h2>

        {billing.history.length === 0 && (
          <p className="text-gray-600">No billing history available.</p>
        )}

        {billing.history.map((inv: any) => (
          <div key={inv.id} className="border-b pb-2">
            <p className="font-semibold">${inv.amount}</p>
            <p className="text-sm text-gray-600">{inv.status}</p>
            <p className="text-xs text-gray-500">
              {new Date(inv.createdAt).toLocaleString()}
            </p>

            <Link
              href={`/client/panel/invoices/${inv.id}`}
              className="text-teal-700 text-sm hover:underline"
            >
              View Invoice
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: any) {
  return (
    <div className="p-6 bg-white border rounded-lg shadow">
      <p className="text-gray-600">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
