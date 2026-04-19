"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRow {
  id: string;
  productName: string | null;
  licenseKey: string;
  annualFeePaidUntil: string | null;
  annualFeePercent: number | null;
  userId: string | null;
  tenantId: string | null;
  status: string;
  createdAt: string;
}

export default function AnnualFeesPage() {
  const supabase = supabaseBrowser();

  const [dueSoon, setDueSoon] = useState<LicenseRow[]>([]);
  const [overdue, setOverdue] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dropdown lists
  const [products, setProducts] = useState<string[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {
    setLoading(true);

    const { data, error } = await supabase
      .from("License")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Annual fee fetch error:", error);
      setLoading(false);
      return;
    }

    const rows = (data as LicenseRow[]) || [];
    const now = new Date();

    // Build dropdown lists
    setProducts(
      Array.from(
        new Set(
          rows
            .map((l) => l.productName)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setTenants(
      Array.from(
        new Set(
          rows
            .map((l) => l.tenantId)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setStatuses(
      Array.from(
        new Set(
          rows
            .map((l) => l.status)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    // Calculate due soon & overdue
    const dueSoonList = rows.filter((lic) => {
      if (!lic.annualFeePaidUntil) return true; // never paid → due immediately
      const paidUntil = new Date(lic.annualFeePaidUntil);
      const diff = paidUntil.getTime() - now.getTime();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // within 30 days
    });

    const overdueList = rows.filter((lic) => {
      if (!lic.annualFeePaidUntil) return true; // never paid → overdue
      const paidUntil = new Date(lic.annualFeePaidUntil);
      return paidUntil.getTime() < now.getTime();
    });

    setDueSoon(dueSoonList);
    setOverdue(overdueList);
    setLoading(false);
  }

  function daysRemaining(date: string | null) {
    if (!date) return "No payment history";

    const now = new Date();
    const paid = new Date(date);
    const diff = paid.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} days remaining`;
    if (days === 0) return "Expires today";
    return `${Math.abs(days)} days overdue`;
  }

  // Apply filters + search
  const filterList = (list: LicenseRow[]) => {
    const s = search.toLowerCase();

    return list.filter((l) => {
      return (
        (productFilter ? l.productName === productFilter : true) &&
        (tenantFilter ? l.tenantId === tenantFilter : true) &&
        (statusFilter ? l.status === statusFilter : true) &&
        (
          l.productName?.toLowerCase().includes(s) ||
          l.licenseKey.toLowerCase().includes(s) ||
          l.status.toLowerCase().includes(s)
        )
      );
    });
  };

  const dueSoonFiltered = filterList(dueSoon);
  const overdueFiltered = filterList(overdue);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Annual Fees</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by product, key, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm flex-1 min-w-[200px]"
        />

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Tenants</option>
          {tenants.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

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
      </div>

      {loading && <p className="text-slate-500">Loading annual fees…</p>}

      {/* DUE SOON */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Due Soon</h2>
      {dueSoonFiltered.length === 0 && (
        <p className="text-slate-500">None due soon.</p>
      )}

      <div className="space-y-3">
        {dueSoonFiltered.map((lic) => (
          <a
            key={lic.id}
            href={`/admin/annual-fees/${lic.id}`}
            className="block border rounded p-4 bg-white hover:bg-slate-50 shadow-sm"
          >
            <p className="font-medium text-lg">{lic.productName}</p>
            <p className="text-sm text-slate-600 font-mono">
              {lic.licenseKey}
            </p>
            <p className="text-sm text-slate-600">
              Paid Until: {lic.annualFeePaidUntil || "Never paid"}
            </p>
            <p className="text-sm text-blue-700 font-semibold">
              {daysRemaining(lic.annualFeePaidUntil)}
            </p>
          </a>
        ))}
      </div>

      {/* OVERDUE */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Overdue</h2>
      {overdueFiltered.length === 0 && (
        <p className="text-slate-500">No overdue fees.</p>
      )}

      <div className="space-y-3">
        {overdueFiltered.map((lic) => (
          <a
            key={lic.id}
            href={`/admin/annual-fees/${lic.id}`}
            className="block border rounded p-4 bg-white hover:bg-slate-50 shadow-sm"
          >
            <p className="font-medium text-lg">{lic.productName}</p>
            <p className="text-sm text-slate-600 font-mono">
              {lic.licenseKey}
            </p>
            <p className="text-sm text-slate-600">
              Paid Until: {lic.annualFeePaidUntil || "Never paid"}
            </p>
            <p className="text-sm text-red-700 font-semibold">
              {daysRemaining(lic.annualFeePaidUntil)}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
