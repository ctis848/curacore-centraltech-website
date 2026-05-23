"use client";

import { useEffect, useState } from "react";

interface PurchaseRecord {
  id: number;
  clientId: number;
  plan: string;
  quantity: number;
  amount: number;
  reference: string;
  channel: string;
  created_at: string;
}

export default function AdminLicensePurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPurchases() {
    setLoading(true);
    const res = await fetch("/api/admin/license-purchases");
    const json = await res.json();
    setPurchases(json.purchases || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold">License Purchases</h1>
        <p className="opacity-90">All license purchases from card, transfer & DVA</p>
      </div>

      {loading && <p className="text-slate-600">Loading...</p>}

      {!loading && purchases.length === 0 && (
        <p className="text-slate-500">No purchases found.</p>
      )}

      {!loading && purchases.length > 0 && (
        <div className="space-y-4">
          {purchases.map((p) => (
            <div
              key={p.id}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {p.plan} — {p.quantity} license(s)
                </p>
                <p className="text-sm text-slate-600">
                  Ref: {p.reference} • {p.channel}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>

              <p className="text-xl font-bold text-emerald-700">
                ₦{p.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
