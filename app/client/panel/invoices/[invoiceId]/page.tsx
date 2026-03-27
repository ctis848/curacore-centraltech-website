/** @jsxImportSource react */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

type Invoice = {
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string;
};

export default function InvoiceDetailsPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;

    fetch("/api/client/invoices", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const found = (d.invoices || []).find(
          (i: Invoice) => i.invoiceId === invoiceId
        );
        if (!found) setNotFound(true);
        else setInvoice(found);
      });
  }, [invoiceId]);

  return (
    <DashboardClient>
      <div className="p-6 space-y-4 max-w-2xl">
        {!invoice && !notFound && <p>Loading invoice...</p>}
        {notFound && <p className="text-red-600">Invoice not found.</p>}
        {invoice && (
          <>
            <h1 className="text-2xl font-bold">
              Invoice {invoice.invoiceId}
            </h1>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Amount:</span>{" "}
                {invoice.currency} {invoice.amount}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {invoice.status}
              </p>
              <p>
                <span className="font-semibold">Issued:</span>{" "}
                {new Date(invoice.issuedAt).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Due:</span>{" "}
                {new Date(invoice.dueAt).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardClient>
  );
}
