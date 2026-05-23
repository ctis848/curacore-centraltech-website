"use client";

import { useEffect, useState } from "react";

interface TransferPayment {
  id: number;
  plan: string;
  amount: number;
  licenses: number;
  email: string;
  company: string;
  proof_url: string;
  status: string;
  created_at: string;
}

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<TransferPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function loadTransfers() {
    setLoading(true);
    const res = await fetch("/api/admin/transfers");
    const json = await res.json();
    setTransfers(json.transfers || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTransfers();
  }, []);

  async function approve(id: number) {
    setProcessingId(id);
    await fetch(`/api/admin/transfers/${id}/approve`, { method: "POST" });
    setProcessingId(null);
    loadTransfers();
  }

  async function reject(id: number) {
    setProcessingId(id);
    await fetch(`/api/admin/transfers/${id}/reject`, { method: "POST" });
    setProcessingId(null);
    loadTransfers();
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-600 text-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold">Transfer Payments</h1>
        <p className="opacity-90">Approve or reject bank transfer submissions</p>
      </div>

      {loading && <p className="text-slate-600">Loading...</p>}

      {!loading && transfers.length === 0 && (
        <p className="text-slate-500">No transfer payments found.</p>
      )}

      {!loading &&
        transfers.map((t) => (
          <div
            key={t.id}
            className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {t.company} — {t.email}
              </p>
              <p className="text-sm text-slate-600">
                {t.plan} • {t.licenses} license(s)
              </p>
              <p className="text-sm text-slate-600">
                ₦{t.amount.toLocaleString()}
              </p>
              <a
                href={t.proof_url}
                target="_blank"
                className="text-xs text-blue-600 underline"
              >
                View Proof
              </a>
            </div>

            {t.status === "PENDING" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => approve(t.id)}
                  disabled={processingId === t.id}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {processingId === t.id ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => reject(t.id)}
                  disabled={processingId === t.id}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span
                className={`px-4 py-1 rounded-lg text-sm font-semibold ${
                  t.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {t.status}
              </span>
            )}
          </div>
        ))}
    </div>
  );
}
