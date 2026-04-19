"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface PaymentRow {
  id: string;
  userid: string | null;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  gateway: string;
  created_at: string;
}

export default function PaymentsPage() {
  const supabase = supabaseBrowser();

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [filtered, setFiltered] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("");

  // Dropdown lists
  const [statuses, setStatuses] = useState<string[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [gateways, setGateways] = useState<string[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("Payment")
      .select("*")
      .order("created_at", { ascending: false }); // matches your column

    if (error) {
      console.error("Payment fetch error:", error);
      setLoading(false);
      return;
    }

    const rows = (data as PaymentRow[]) || [];

    setPayments(rows);
    setFiltered(rows);

    // Build dropdown lists (TS-safe)
    setStatuses(
      Array.from(
        new Set(
          rows
            .map((p) => p.status)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setCurrencies(
      Array.from(
        new Set(
          rows
          .map((p) => p.currency)
          .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setGateways(
      Array.from(
        new Set(
          rows
            .map((p) => p.gateway)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setLoading(false);
  }

  // Apply filters + search
  useEffect(() => {
    const s = search.toLowerCase();

    const results = payments.filter((p) => {
      return (
        (statusFilter ? p.status === statusFilter : true) &&
        (currencyFilter ? p.currency === currencyFilter : true) &&
        (gatewayFilter ? p.gateway === gatewayFilter : true) &&
        (
          p.reference.toLowerCase().includes(s) ||
          p.status.toLowerCase().includes(s) ||
          p.currency.toLowerCase().includes(s) ||
          p.gateway.toLowerCase().includes(s) ||
          (p.userid ?? "").toLowerCase().includes(s)
        )
      );
    });

    setFiltered(results);
  }, [search, statusFilter, currencyFilter, gatewayFilter, payments]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Payments</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by reference, status, currency, gateway, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Currencies</option>
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={gatewayFilter}
          onChange={(e) => setGatewayFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Gateways</option>
          {gateways.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-slate-500">Loading payments…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No payments found.</p>
      )}

      {/* Payment List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <a
            key={p.id}
            href={`/admin/payments/${p.id}`}
            className="block border rounded p-4 bg-white hover:bg-slate-50 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-lg">Payment</p>
                <p className="text-sm text-slate-600 font-mono">
                  Ref: {p.reference}
                </p>
                <p className="text-sm text-slate-600">
                  Gateway: {p.gateway}
                </p>
                <p className="text-sm text-slate-600">
                  User: {p.userid || "—"}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-emerald-700">
                  {p.amount.toLocaleString()} {p.currency}
                </p>

                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    p.status === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : p.status === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Created: {new Date(p.created_at).toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
