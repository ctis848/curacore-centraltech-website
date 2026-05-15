"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface PaymentRow {
  id: string;
  invoice_id: string | null;
  amount: number;
  created_at: string | null;
}

export default function PaymentsPage() {
  const supabase = supabaseBrowser();

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [filtered, setFiltered] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments") // ✅ correct table name
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment fetch error:", error);
      setLoading(false);
      return;
    }

    const rows = (data as PaymentRow[]) || [];

    setPayments(rows);
    setFiltered(rows);
    setLoading(false);
  }

  // Simple search by id, invoice_id
  useEffect(() => {
    const s = search.toLowerCase();

    const results = payments.filter((p) => {
      return (
        p.id.toLowerCase().includes(s) ||
        (p.invoice_id ?? "").toLowerCase().includes(s)
      );
    });

    setFiltered(results);
  }, [search, payments]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Payments</h1>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by payment ID or invoice ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />
      </div>

      {loading && <p className="text-slate-500">Loading payments…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No payments found.</p>
      )}

      {/* Payment List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="block border rounded p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-lg">Payment</p>
                <p className="text-sm text-slate-600 font-mono">
                  Payment ID: {p.id}
                </p>
                <p className="text-sm text-slate-600">
                  Invoice ID: {p.invoice_id || "—"}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-emerald-700">
                  {Number(p.amount).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Created:{" "}
              {p.created_at
                ? new Date(p.created_at).toLocaleString()
                : "Unknown"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
