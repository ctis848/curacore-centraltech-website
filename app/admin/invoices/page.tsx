"use client";

import { useEffect, useState } from "react";

interface InvoiceItem {
  path: string;
  created_at: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInvoices() {
    setLoading(true);
    const res = await fetch("/api/admin/invoices");
    const json = await res.json();
    setInvoices(json.invoices || []);
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold">Invoices</h1>
        <p className="opacity-90">All generated PDF invoices</p>
      </div>

      {loading && <p className="text-slate-600">Loading...</p>}

      {!loading && invoices.length === 0 && (
        <p className="text-slate-500">No invoices found.</p>
      )}

      {!loading && invoices.length > 0 && (
        <div className="space-y-4">
          {invoices.map((inv, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-slate-900">{inv.path}</p>
                <p className="text-xs text-slate-500">
                  {new Date(inv.created_at).toLocaleString()}
                </p>
              </div>

              <a
                href={inv.path}
                target="_blank"
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                View PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
