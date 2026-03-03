"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my-invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Invoice #{invoice.id}</p>
            <p className="text-sm text-gray-500">{invoice.plan}</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="font-semibold">
              ₦{invoice.amount.toLocaleString()}
            </p>

            <Link href={`/api/invoice/pdf?id=${invoice.id}`} target="_blank">
              <Button variant="outline">Download PDF</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
