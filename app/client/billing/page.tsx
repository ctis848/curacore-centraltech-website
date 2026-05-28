"use client";

import { useEffect, useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    async function loadBilling() {
      const res = await fetch("/api/client/billing");
      const data = await res.json();

      setBilling(data.billing);
      setInvoices(data.invoices || []);
      setLoading(false);
    }

    loadBilling();
  }, []);

  if (loading) {
    return <div className="p-8 text-lg">Loading billing details...</div>;
  }

  if (!billing) {
    return <div className="p-8 text-lg">No billing information found.</div>;
  }

  const {
    companyName,
    companyEmail,
    amountDue,
    nextRenewalDate,
    planName,
    companyId,
  } = billing;

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold text-teal-700">Billing & Subscription</h1>

      {/* Subscription Summary */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Subscription Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500">Company Name</p>
            <p className="font-semibold">{companyName}</p>
          </div>

          <div>
            <p className="text-gray-500">Plan</p>
            <p className="font-semibold">{planName}</p>
          </div>

          <div>
            <p className="text-gray-500">Next Renewal Date</p>
            <p className="font-semibold">{nextRenewalDate}</p>
          </div>

          <div>
            <p className="text-gray-500">Amount Due</p>
            <p className="font-semibold text-red-600">₦{amountDue}</p>
          </div>
        </div>

        <button
          onClick={() => window.open("/client/renew-annual", "_blank")}
          className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700"
        >
          Renew Subscription
        </button>
      </div>

      {/* Invoice History */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Invoice History
        </h2>

        {invoices.length === 0 ? (
          <p className="text-gray-500">No invoices found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3">Invoice #</th>
                <th className="border p-3">Amount</th>
                <th className="border p-3">Date</th>
                <th className="border p-3">Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={idx}>
                  <td className="border p-3">{inv.invoice_number}</td>
                  <td className="border p-3">₦{inv.amount}</td>
                  <td className="border p-3">{inv.created_at}</td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() =>
                        window.open(
                          `/api/invoice/generate?invoiceNumber=${inv.invoice_number}&companyName=${companyName}&companyEmail=${companyEmail}&amount=${inv.amount}&planName=${planName}&createdDate=${inv.created_at}&dueDate=${inv.created_at}`,
                          "_blank"
                        )
                      }
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
