"use client";

import { useEffect, useState } from "react";

export default function InvoicePreview({ params }: any) {
  const { invoiceNumber } = params;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      const res = await fetch(`/api/invoice/get?invoiceNumber=${invoiceNumber}`);
      const data = await res.json();
      setInvoice(data.invoice);
      setLoading(false);
    }
    loadInvoice();
  }, [invoiceNumber]);

  if (loading) return <div className="p-8">Loading invoice...</div>;
  if (!invoice) return <div className="p-8">Invoice not found.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">
        Invoice #{invoice.invoice_number}
      </h1>

      <div
        className="border p-6 rounded-lg bg-gray-50"
        dangerouslySetInnerHTML={{ __html: invoice.html }}
      />

      <div className="mt-8 flex gap-4">
        <button
          onClick={() =>
            window.open(
              `/api/invoice/generate?invoiceNumber=${invoice.invoice_number}&companyName=${invoice.company_name}&companyEmail=${invoice.company_email}&amount=${invoice.amount}&planName=${invoice.plan_name}&createdDate=${invoice.created_at}&dueDate=${invoice.due_date}`,
              "_blank"
            )
          }
          className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700"
        >
          Download PDF
        </button>

        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800"
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
}
