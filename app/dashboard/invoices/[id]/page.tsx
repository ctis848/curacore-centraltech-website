'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ViewInvoicePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/my-invoices?id=${id}`);
      const data = await res.json();
      setInvoice(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 dark:text-gray-300">
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-10 text-center text-red-600 dark:text-red-400">
        Invoice not found.
      </div>
    );
  }

  const statusColor =
    invoice.status === 'paid'
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : invoice.status === 'pending'
      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-teal-900 dark:text-teal-300">
          Invoice Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review your payment information and download or print your invoice.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 sm:p-8 border border-teal-100 dark:border-gray-700">
        {/* Branding */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 dark:text-teal-300">
            CENTRALCORE EMR
          </h2>
          <p className="text-teal-700 dark:text-teal-400 font-medium">
            Official Payment Invoice
          </p>
        </div>

        {/* Invoice Info */}
        <div className="space-y-4 text-sm sm:text-base">
          <InvoiceRow label="Invoice ID" value={invoice.id} />
          <InvoiceRow label="Email" value={invoice.email} />
          <InvoiceRow label="Plan" value={invoice.plan} />
          <InvoiceRow label="Quantity" value={invoice.quantity} />
          <InvoiceRow
            label="Amount"
            value={`₦${invoice.amount.toLocaleString()} ${invoice.currency}`}
          />
          <InvoiceRow
            label="Status"
            value={
              <span className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
                {invoice.status}
              </span>
            }
          />
          <InvoiceRow
            label="Created"
            value={new Date(invoice.created_at).toLocaleString()}
          />
          {invoice.paid_at && (
            <InvoiceRow
              label="Paid"
              value={new Date(invoice.paid_at).toLocaleString()}
            />
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-teal-200 dark:border-gray-700 my-8"></div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/dashboard/invoices"
            className="text-teal-700 dark:text-teal-300 font-semibold hover:underline"
          >
            ← Back to Invoices
          </Link>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-5 py-3 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Print Invoice
            </button>

            <a
              href={`/api/invoice/pdf?id=${invoice.id}`}
              className="bg-teal-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-800 transition"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 dark:text-gray-400 mt-10 text-sm">
        CentralCore EMR — Modern Healthcare, Simplified.
      </p>
    </div>
  );
}

function InvoiceRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <span className="text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}
