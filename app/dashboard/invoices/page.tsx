"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Invoice {
  id: string;
  client_id: string;
  license_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
}

interface License {
  id: string;
  product_name: string;
  license_key: string;
}

export default function InvoiceHistoryPage() {
  const supabase = createSupabaseClient();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all licenses for this client
      const { data: licenseData } = await supabase
        .from("licenses")
        .select("id, product_name, license_key")
        .eq("client_id", user.id);

      if (licenseData) {
        setLicenses(licenseData);
      }

      // Load invoices for this client
      const { data: invoiceData } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", user.id)
        .order("issued_at", { ascending: false });

      if (invoiceData) {
        setInvoices(invoiceData);
      }

      setLoading(false);
    }

    loadInvoices();
  }, []);

  if (loading) {
    return <p className="p-6">Loading invoice history...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Invoice History</h1>

      {invoices.length === 0 && (
        <p className="text-gray-600">No invoices found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {invoices.map((inv) => {
          const license = licenses.find((l) => l.id === inv.license_id);

          return (
            <div
              key={inv.id}
              className="p-5 bg-white shadow rounded border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">
                Invoice #{inv.invoice_number}
              </h2>

              <p className="text-sm text-gray-700">
                <strong>Product:</strong>{" "}
                {license?.product_name || "Unknown Product"}
              </p>

              <p className="text-sm text-gray-700">
                <strong>License Key:</strong> {license?.license_key}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Amount:</strong> {inv.currency} {inv.amount}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    inv.status === "paid"
                      ? "text-green-600"
                      : inv.status === "unpaid"
                      ? "text-red-600"
                      : "text-gray-600"
                  }
                >
                  {inv.status.toUpperCase()}
                </span>
              </p>

              <p className="text-sm text-gray-700">
                <strong>Issued:</strong>{" "}
                {new Date(inv.issued_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
