"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Invoice = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Invoice #{invoice.id}</p>
            <p className="text-sm text-gray-600">
              ₦{invoice.amount.toLocaleString()} — {invoice.status}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/api/invoice/pdf?id=${invoice.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Download</Button>
            </Link>

            <Link href={`/dashboard/invoices/${invoice.id}`}>
              <Button variant="default">View</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
