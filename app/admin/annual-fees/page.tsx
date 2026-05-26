"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Client = {
  companyname: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

type LicenseRow = {
  id: string;
  productName: string | null;
  licenseKey: string | null;
  annualFeePercent: number | null;
  renewalduedate: string | null;
  renewalstatus: string | null;
  clientId: string | null;
  Client: Client | null;
  baseFee: number;
  additionalFee: number;
  finalFee: number;
};

export default function AnnualFeesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rows, setRows] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">(
    "ALL"
  );
  const [clientFilter, setClientFilter] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    loadAnnualFees();
  }, []);

  async function loadAnnualFees() {
    setLoading(true);

    const { data, error } = await supabase
      .from("License")
      .select(
        `
        id,
        productName,
        licenseKey,
        annualFeePercent,
        renewalduedate,
        renewalstatus,
        clientId,
        Client:clientId (
          companyname,
          email,
          phone,
          address
        )
      `
      )
      .order("renewalduedate", { ascending: true });

    if (error) {
      console.error("Failed to load licenses:", error);
      setLoading(false);
      return;
    }

    const baseFee = 150000;

    const processed: LicenseRow[] = (data || []).map((license: any) => {
      const percent = license.annualFeePercent || 0;
      const additionalFee = (percent / 100) * baseFee;
      const finalFee = baseFee + additionalFee;

      return {
        ...license,
        baseFee,
        additionalFee,
        finalFee,
      };
    });

    setRows(processed);
    setLoading(false);
  }

  function getUrgencyColor(date: string | null) {
    if (!date) return "bg-gray-500";

    const today = new Date();
    const due = new Date(date);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "bg-red-600";
    if (diffDays <= 7) return "bg-orange-500";
    return "bg-green-600";
  }

  function isPaid(status: string | null) {
    if (!status) return false;
    return status.toUpperCase() === "PAID";
  }

  async function togglePaid(row: LicenseRow) {
    const newStatus = isPaid(row.renewalstatus) ? "UNPAID" : "PAID";

    const { error } = await supabase
      .from("License")
      .update({ renewalstatus: newStatus })
      .eq("id", row.id);

    if (error) {
      console.error("Failed to update payment status:", error);
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, renewalstatus: newStatus } : r
      )
    );
  }

  async function sendReminder(row: LicenseRow) {
    alert(
      `Reminder would be sent to ${row.Client?.email || "unknown email"} for ${
        row.Client?.companyname || "Unknown Client"
      }.`
    );
  }

  function exportToCSV() {
    const header = [
      "Client",
      "Email",
      "Product",
      "License Key",
      "Base Fee",
      "Additional Fee",
      "Total Fee",
      "Due Date",
      "Status",
    ];

    const lines = filteredRows.map((row) => [
      row.Client?.companyname || "",
      row.Client?.email || "",
      row.productName || "",
      row.licenseKey || "",
      row.baseFee,
      row.additionalFee,
      row.finalFee,
      row.renewalduedate
        ? new Date(row.renewalduedate).toISOString().split("T")[0]
        : "",
      row.renewalstatus || "",
    ]);

    const csv =
      [header, ...lines]
        .map((line) =>
          line
            .map((value) =>
              typeof value === "string"
                ? `"${value.replace(/"/g, '""')}"`
                : value
            )
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annual_fees.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const clients = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.Client?.companyname) set.add(r.Client.companyname);
    });
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const clientName = row.Client?.companyname || "";
      const email = row.Client?.email || "";
      const product = row.productName || "";
      const key = row.licenseKey || "";

      const text = `${clientName} ${email} ${product} ${key}`.toLowerCase();
      const s = search.toLowerCase();
      if (s && !text.includes(s)) return false;

      if (clientFilter !== "ALL" && clientName !== clientFilter) return false;

      if (statusFilter === "PAID" && !isPaid(row.renewalstatus)) return false;
      if (statusFilter === "UNPAID" && isPaid(row.renewalstatus)) return false;

      if (fromDate) {
        if (!row.renewalduedate) return false;
        if (new Date(row.renewalduedate) < new Date(fromDate)) return false;
      }

      if (toDate) {
        if (!row.renewalduedate) return false;
        if (new Date(row.renewalduedate) > new Date(toDate)) return false;
      }

      return true;
    });
  }, [rows, search, statusFilter, clientFilter, fromDate, toDate]);

  if (loading) {
    return <div className="p-6">Loading annual fees…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Annual License Fees</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Search</label>
          <input
            className="border rounded px-2 py-1 min-w-[220px]"
            placeholder="Client, product, license key…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Client</label>
          <select
            className="border rounded px-2 py-1"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="ALL">All clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Payment status</label>
          <select
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | "PAID" | "UNPAID")
            }
          >
            <option value="ALL">All</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Due from</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Due to</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          onClick={exportToCSV}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">License Key</th>
              <th className="p-2 border">Base Fee</th>
              <th className="p-2 border">Additional Fee</th>
              <th className="p-2 border">Total Fee</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={9}>
                  No licenses match your filters.
                </td>
              </tr>
            )}

            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-2 border align-top">
                  <div className="font-semibold">
                    {row.Client?.companyname || "—"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {row.Client?.email || "No email"}
                  </div>
                </td>

                <td className="p-2 border align-top">
                  {row.productName || "—"}
                </td>

                <td className="p-2 border align-top">
                  <code className="text-xs">{row.licenseKey || "—"}</code>
                </td>

                <td className="p-2 border align-top">
                  ₦{row.baseFee.toLocaleString()}
                </td>

                <td className="p-2 border align-top">
                  ₦{row.additionalFee.toLocaleString()}
                </td>

                <td className="p-2 border align-top font-bold">
                  ₦{row.finalFee.toLocaleString()}
                </td>

                <td className="p-2 border align-top">
                  {row.renewalduedate
                    ? new Date(row.renewalduedate).toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-2 border align-top">
                  <span
                    className={`px-3 py-1 rounded text-white text-xs ${getUrgencyColor(
                      row.renewalduedate
                    )}`}
                  >
                    {row.renewalstatus || "UNKNOWN"}
                  </span>
                </td>

                <td className="p-2 border align-top space-y-1">
                  <button
                    onClick={() => togglePaid(row)}
                    className={`w-full px-2 py-1 rounded text-xs ${
                      isPaid(row.renewalstatus)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {isPaid(row.renewalstatus) ? "Mark Unpaid" : "Mark Paid"}
                  </button>

                  <button
                    onClick={() => sendReminder(row)}
                    className="w-full px-2 py-1 rounded text-xs bg-purple-600 text-white"
                  >
                    Send Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
