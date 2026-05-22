"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

import Analytics from "@/components/payments/analytics";
import FiltersSidebar from "@/components/payments/filters";
import TimelineDrawer from "@/components/payments/timeline";
import UserDrawer from "@/components/payments/user";
import ViewPaymentModal from "@/components/payments/modal";
import ExportBar from "@/components/payments/export";

export type PaymentRow = {
  id: string;
  userid: string | null;
  email: string | null;
  reference: string | null;
  amount: number;
  currency: string | null;
  status: string | null;
  gateway: string | null;
  channel: string | null;
  invoice_id: string | null;
  created_at: string | null;
  admin_notes?: string | null;
};

export type UserDetails = {
  id: string;
  email: string;
  created_at?: string | null;
};

export type TimelineEvent = {
  id: string;
  payment_id: string;
  event_type: string;
  message: string | null;
  created_at: string;
};

export default function AdminPaymentsPage() {
  const supabase = supabaseBrowser();

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [gatewayFilter, setGatewayFilter] = useState<string>("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof PaymentRow>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment fetch error:", error);
      setLoading(false);
      return;
    }

    setPayments((data as PaymentRow[]) || []);
    setLoading(false);
    setPage(1);
  }

  function handleSort(field: keyof PaymentRow) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortIcon(field: keyof PaymentRow) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function applyDateFilter(created: string | null) {
    if (!created) return false;
    const createdDate = new Date(created).getTime();
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (createdDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      if (createdDate > to) return false;
    }
    return true;
  }

  function applyAmountFilter(amount: number) {
    const min = minAmount ? Number(minAmount) : null;
    const max = maxAmount ? Number(maxAmount) : null;
    if (min !== null && amount < min) return false;
    if (max !== null && amount > max) return false;
    return true;
  }

  function setPresetDays(days: number) {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(now.toISOString().slice(0, 10));
  }

  function setPresetThisMonth() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  }

  function setPresetThisYear() {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  }

  const processed = useMemo(() => {
    let rows = [...payments];

    const s = search.toLowerCase();

    rows = rows.filter((p) => {
      const matchesSearch =
        (p.id ?? "").toLowerCase().includes(s) ||
        (p.invoice_id ?? "").toLowerCase().includes(s) ||
        (p.email ?? "").toLowerCase().includes(s) ||
        (p.reference ?? "").toLowerCase().includes(s) ||
        (p.gateway ?? "").toLowerCase().includes(s) ||
        (p.channel ?? "").toLowerCase().includes(s) ||
        (p.status ?? "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" ||
        (p.status ?? "").toLowerCase() === statusFilter.toLowerCase();

      const matchesGateway =
        gatewayFilter === "ALL" ||
        (p.gateway ?? "").toLowerCase() === gatewayFilter.toLowerCase();

      const matchesChannel =
        channelFilter === "ALL" ||
        (p.channel ?? "").toLowerCase() === channelFilter.toLowerCase();

      const matchesDate = applyDateFilter(p.created_at);
      const matchesAmount = applyAmountFilter(p.amount);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGateway &&
        matchesChannel &&
        matchesDate &&
        matchesAmount
      );
    });

    rows.sort((a, b) => {
      const A = (a[sortField] ?? "").toString().toLowerCase();
      const B = (b[sortField] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    payments,
    search,
    statusFilter,
    gatewayFilter,
    channelFilter,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(processed.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = processed.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  const uniqueStatuses = Array.from(
    new Set(payments.map((p) => p.status).filter(Boolean))
  ) as string[];

  const uniqueGateways = Array.from(
    new Set(payments.map((p) => p.gateway).filter(Boolean))
  ) as string[];

  const uniqueChannels = Array.from(
    new Set(payments.map((p) => p.channel).filter(Boolean))
  ) as string[];

  function totalAmount() {
    return processed.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }

  async function openUserDrawer(userid: string | null) {
    if (!userid) return;
    const { data } = await supabase
      .from("auth.users")
      .select("id, email, created_at")
      .eq("id", userid)
      .maybeSingle();

    if (data) {
      setUserDetails({
        id: data.id,
        email: data.email,
        created_at: data.created_at,
      });
      setUserDrawerOpen(true);
    }
  }

  async function openTimeline(paymentId: string) {
    const { data } = await supabase
      .from("payment_timeline")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false });

    setTimelineEvents((data as TimelineEvent[]) || []);
    setTimelineOpen(true);
  }

  async function saveAdminNotes(paymentId: string, notes: string) {
    const { error } = await supabase
      .from("payments")
      .update({ admin_notes: notes })
      .eq("id", paymentId);

    if (!error) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, admin_notes: notes } : p
        )
      );
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Title */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Payments
      </h1>

      <Analytics totalCount={processed.length} totalAmount={totalAmount()} />

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by ID, email, reference, invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-lg shadow-sm flex-1 min-w-[220px] focus:ring-2 focus:ring-purple-400"
        />

        <button
          onClick={() => setFiltersOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg shadow hover:brightness-110"
        >
          Filters
        </button>
      </div>

      <ExportBar payments={processed} />

      {loading && <p className="text-slate-500">Loading payments…</p>}

      {!loading && processed.length === 0 && (
        <p className="text-slate-500">No payments found.</p>
      )}

      {!loading && processed.length > 0 && (
        <div className="overflow-x-auto border rounded-xl bg-white shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-purple-200 to-blue-200 text-slate-700">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("created_at")}
                >
                  Created{getSortIcon("created_at")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("amount")}
                >
                  Amount{getSortIcon("amount")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th
                  className="px-4 py-3 cursor-pointer text-left font-semibold"
                  onClick={() => handleSort("reference")}
                >
                  Reference{getSortIcon("reference")}
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Gateway</th>
                <th className="px-4 py-3 text-left font-semibold">Channel</th>
                <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    ₦{Number(p.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {p.email || (
                      <span className="text-slate-400 italic">No email</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono break-all">
                    {p.reference || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        (p.status || "").toLowerCase() === "success"
                          ? "bg-green-100 text-green-700"
                          : (p.status || "").toLowerCase() === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {p.status || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                      {p.gateway || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                      {p.channel || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.invoice_id ? (
                      <span className="font-mono text-xs">{p.invoice_id}</span>
                    ) : (
                      <span className="text-slate-400 italic">No invoice</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setViewOpen(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    {p.userid && (
                      <button
                        onClick={() => openUserDrawer(p.userid)}
                        className="text-indigo-600 hover:underline"
                      >
                        User
                      </button>
                    )}
                    <button
                      onClick={() => openTimeline(p.id)}
                      className="text-purple-600 hover:underline"
                    >
                      Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
          className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-300"
        >
          Previous
        </button>

        <span className="text-sm font-semibold">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
          className="px-4 py-2 bg-purple-200 rounded-lg disabled:opacity-50 hover:bg-purple-300"
        >
          Next
        </button>
      </div>

      <ViewPaymentModal
        open={viewOpen}
        payment={selectedPayment}
        onClose={() => setViewOpen(false)}
        onSaveNotes={saveAdminNotes}
      />

      <UserDrawer
        open={userDrawerOpen}
        user={userDetails}
        onClose={() => setUserDrawerOpen(false)}
      />

      <TimelineDrawer
        open={timelineOpen}
        events={timelineEvents}
        onClose={() => setTimelineOpen(false)}
      />

      <FiltersSidebar
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        gatewayFilter={gatewayFilter}
        setGatewayFilter={setGatewayFilter}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        uniqueStatuses={uniqueStatuses}
        uniqueGateways={uniqueGateways}
        uniqueChannels={uniqueChannels}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        maxAmount={maxAmount}
        setMaxAmount={setMaxAmount}
        setPresetDays={setPresetDays}
        setPresetThisMonth={setPresetThisMonth}
        setPresetThisYear={setPresetThisYear}
      />
    </div>
  );
}
