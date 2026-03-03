"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BillingHistory({ userId }: { userId: string }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my-invoices");
      const data = await res.json();
      setHistory(data.invoices || []);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      {history.map((invoice) => (
        <Card key={invoice.id} className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Invoice #{invoice.id}</p>
            <p className="text-sm text-gray-500">{invoice.plan}</p>
          </div>

          <div className="text-right">
            <p className="font-semibold">₦{invoice.amount.toLocaleString()}</p>
            <Badge
              variant={invoice.status === "paid" ? "default" : "destructive"}
            >
              {invoice.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
