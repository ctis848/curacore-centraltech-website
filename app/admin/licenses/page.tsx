"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface LicenseRow {
  id: string;
  productName: string | null;
  licenseKey: string;
  status: string;
  tenantId: string | null;
  userId: string | null;
  createdAt: string;
}

type Role = "ADMIN" | "MANAGER" | "SUPPORT" | "VIEWER";

export default function LicensesPage({ role = "ADMIN" }: { role?: Role }) {
  const supabase = supabaseBrowser();

  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [filtered, setFiltered] = useState<LicenseRow[]>([]);
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
    loadLicenses();
  }, []);

  async function loadLicenses() {
    setLoading(true);

    const { data, error } = await supabase
      .from("License")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("License fetch error:", error);
      setLoading(false);
      return;
    }

    const rows = (data as LicenseRow[]) || [];

    setLicenses(rows);
    setFiltered(rows);

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

    setLoading(false);
  }

  // Apply filters + search
  useEffect(() => {
    const s = search.toLowerCase();

    const results = licenses.filter((l) => {
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

    setFiltered(results);
  }, [search, productFilter, tenantFilter, statusFilter, licenses]);

  // Role-based column visibility
  const canSeeUser = role === "ADMIN" || role === "MANAGER";
  const canSeeTenant = role !== "VIEWER";
  const canSeeActions = role === "ADMIN" || role === "MANAGER";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Licenses</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
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

        {canSeeTenant && (
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
        )}

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

      {loading && <p className="text-slate-500">Loading licenses…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-slate-500">No licenses found.</p>
      )}

      {/* TABLE VIEW */}
      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">License Key</th>
              {canSeeTenant && <th className="px-4 py-2 text-left">Tenant</th>}
              {canSeeUser && <th className="px-4 py-2 text-left">User</th>}
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              {canSeeActions && <th className="px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((lic) => (
              <tr key={lic.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2">{lic.productName}</td>
                <td className="px-4 py-2 font-mono">{lic.licenseKey}</td>

                {canSeeTenant && (
                  <td className="px-4 py-2">{lic.tenantId || "—"}</td>
                )}

                {canSeeUser && (
                  <td className="px-4 py-2">{lic.userId || "—"}</td>
                )}

                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      lic.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : lic.status === "EXPIRED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {lic.status}
                  </span>
                </td>

                <td className="px-4 py-2">
                  {new Date(lic.createdAt).toLocaleString()}
                </td>

                {canSeeActions && (
                  <td className="px-4 py-2">
                    <a
                      href={`/admin/licenses/${lic.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
