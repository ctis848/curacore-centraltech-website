"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteModal from "@/components/DeleteModal";

// Coupon Type
export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expires: string;
  max_uses: number;
  used: number;
  active: boolean;
  created_at: string;
}

type SortKey = "code" | "value" | "used" | "expires" | "created_at";
type SortDirection = "asc" | "desc";

export default function CouponListPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [filterType, setFilterType] = useState<"all" | "percentage" | "fixed">("all");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Loading
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load coupons
  const loadCoupons = async () => {
    setLoading(true);
    const res = await fetch("/api/coupons/list");
    const json = await res.json();
    setCoupons(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Toggle active/inactive
  const toggleActive = async (id: string, active: boolean) => {
    await fetch("/api/coupons/toggle", {
      method: "POST",
      body: JSON.stringify({ id, active }),
    });
    loadCoupons();
  };

  // Open delete modal
  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Perform delete
  const deleteCoupon = async () => {
    if (!deleteId) return;

    await fetch("/api/coupons/delete", {
      method: "POST",
      body: JSON.stringify({ id: deleteId }),
    });

    setShowDeleteModal(false);
    setDeleteId(null);
    loadCoupons();
  };

  // Apply filters
  const applyFilters = (list: Coupon[]) => {
    let result = [...list];

    // Search
    result = result.filter((c) =>
      c.code.toLowerCase().includes(search.toLowerCase())
    );

    // Status filter
    if (filterStatus === "active") result = result.filter((c) => c.active);
    if (filterStatus === "inactive") result = result.filter((c) => !c.active);
    if (filterStatus === "expired")
      result = result.filter((c) => new Date(c.expires) < new Date());

    // Type filter
    if (filterType !== "all") result = result.filter((c) => c.type === filterType);

    return result;
  };

  // Apply sorting
  const applySorting = (list: Coupon[]) => {
    return [...list].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Apply pagination
  const applyPagination = (list: Coupon[]) => {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  };

  const filtered = applySorting(applyFilters(coupons));
  const paginated = applyPagination(filtered);

  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div>

      {/* HEADER + CREATE BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>

        <Link
          href="/admin/coupons/create"
          className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700"
        >
          + Create Coupon
        </Link>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Search */}
        <input
          type="text"
          placeholder="Search coupon code..."
          className="border px-3 py-2 rounded w-full"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {/* Status Filter */}
        <select
          className="border px-3 py-2 rounded"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as any);
            setPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>

        {/* Type Filter */}
        <select
          className="border px-3 py-2 rounded"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as any);
            setPage(1);
          }}
        >
          <option value="all">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      {/* Sorting */}
      <div className="flex gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="created_at">Created Date</option>
          <option value="code">Code</option>
          <option value="value">Value</option>
          <option value="used">Usage</option>
          <option value="expires">Expiry Date</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value as SortDirection)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Page Size */}
        <select
          className="border px-3 py-2 rounded ml-auto"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* Loading */}
      {loading && <div className="p-6 text-slate-600">Loading coupons...</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="p-6 text-slate-500">No coupons found.</div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <>
          <table className="w-full bg-white shadow rounded">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Usage</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3 font-semibold">{c.code}</td>
                  <td className="p-3 capitalize">{c.type}</td>
                  <td className="p-3">
                    {c.type === "percentage" ? `${c.value}%` : `₦${c.value}`}
                  </td>
                  <td className="p-3">
                    {c.used} / {c.max_uses}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 flex gap-4">
                    <a
                      href={`/admin/coupons/${c.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </a>

                    <button
                      onClick={() => toggleActive(c.id, !c.active)}
                      className="text-yellow-600 hover:underline"
                    >
                      Toggle
                    </button>

                    <button
                      onClick={() => confirmDelete(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded border ${
                page === 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-slate-100"
              }`}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border ${
                    p === page
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded border ${
                page === totalPages
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-slate-100"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={showDeleteModal}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={deleteCoupon}
      />
    </div>
  );
}
