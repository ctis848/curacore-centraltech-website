"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRow {
  id: string;
  productName: string | null;
  licenseKey: string;
  expiresAt: string | null;
  tenantId: string | null;
  userId: string | null;
  status: string;
  createdAt: string;
}

export default function RenewalsPage() {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [dueSoon, setDueSoon] = useState<LicenseRow[]>([]);
  const [expired, setExpired] = useState<LicenseRow[]>([]);
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
    loadRenewals();
  }, []);

  async function loadRenewals() {
    setLoading(true);

    const { data, error } = await supabase
      .from("License")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Renewals fetch error:", error);
      setLoading(false);
      return;
    }

    const licenseList = (data as LicenseRow[]) || [];

    setLicenses(licenseList);

    // Build dropdown lists safely
    setProducts(
      Array.from(
        new Set(
          licenseList
            .map((l) => l.productName)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setTenants(
      Array.from(
        new Set(
          licenseList
            .map((l) => l.tenantId)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    setStatuses(
      Array.from(
        new Set(
          licenseList
            .map((l) => l.status)
            .filter((v): v is string => typeof v === "string")
        )
      )
    );

    // Renewal logic
    const now = new Date();

    const dueSoonList = licenseList.filter((lic) => {
      if (!lic.expiresAt) return false;
      const exp = new Date(lic.expiresAt);
      const diff = exp.getTime() - now.getTime();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    });

    const expiredList = licenseList.filter((lic) => {
      if (!lic.expiresAt) return false;
      const exp = new Date(lic.expiresAt);
      return exp.getTime() < now.getTime();
    });

    setDueSoon(dueSoonList);
    setExpired(expiredList);
    setLoading(false);
  }

  // Search + filters
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
  const expiredFiltered = filterList(expired);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Renewals</h1>

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

      {loading && <p className="text-slate-500">Loading renewals…</p>}

      {/* Due Soon */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Due Soon</h2>
      {dueSoonFiltered.length === 0 && (
        <p className="text-slate-500">No licenses due soon.</p>
      )}

      <div className="space-y-3">
        {dueSoonFiltered.map((lic) => (
          <a
            key={lic.id}
            href={`/admin/renewals/${lic.id}`}
            className="block border rounded p-4 bg-white hover:bg-slate-50 shadow-sm"
          >
            <p className="font-medium text-lg">{lic.productName}</p>
            <p className="text-sm text-slate-600 font-mono">{lic.licenseKey}</p>
            <p className="text-sm text-slate-600">
              Expires: {lic.expiresAt || "Unknown"}
            </p>
          </a>
        ))}
      </div>

      {/* Expired */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Expired</h2>
      {expiredFiltered.length === 0 && (
        <p className="text-slate-500">No expired licenses.</p>
      )}

      <div className="space-y-3">
        {expiredFiltered.map((lic) => (
          <a
            key={lic.id}
            href={`/admin/renewals/${lic.id}`}
            className="block border rounded p-4 bg-white hover:bg-slate-50 shadow-sm"
          >
            <p className="font-medium text-lg">{lic.productName}</p>
            <p className="text-sm text-slate-600 font-mono">{lic.licenseKey}</p>
            <p className="text-sm text-red-700 font-semibold">
              Expired: {lic.expiresAt || "Unknown"}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
