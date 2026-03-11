"use client";

import { jsPDF } from "jspdf";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

export default function InvoiceDownloadButton({ invoice }: { invoice: Invoice }) {
  const download = () => {
    const doc = new jsPDF();
    doc.text("Invoice Receipt", 10, 10);
    doc.text(`Amount: ₦${invoice.amount}`, 10, 20);
    doc.text(`Status: ${invoice.status}`, 10, 30);
    doc.text(`Date: ${invoice.created_at}`, 10, 40);
    doc.text(`Description: ${invoice.description}`, 10, 50);
    doc.save(`invoice-${invoice.id}.pdf`);
  };

  return (
    <button
      onClick={download}
      className="px-3 py-1 bg-purple-600 text-white rounded"
    >
      Download Receipt
    </button>
  );
}
