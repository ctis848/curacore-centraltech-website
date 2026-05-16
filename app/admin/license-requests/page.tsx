import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminLicenseRequestsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    q?: string;
    status?: string;
    sort?: string;
    dir?: string;
  };
}) {
  const supabase = supabaseAdmin;

  // Pagination
  const page = Number(searchParams.page || 1);
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Search
  const q = searchParams.q?.trim() || "";

  // Filter
  const status = searchParams.status || "";

  // Sorting
  const sort = searchParams.sort || "requestedAt";
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  // Base query
  let query = supabase
    .from("LicenseRequest")
    .select(
      `
      id,
      userId,
      productName,
      requestedAt,
      status,
      notes,
      requestKey,
      companyName,
      userEmail
    `,
      { count: "exact" }
    )
    .order(sort, { ascending: dir === "asc" })
    .range(from, to);

  // Apply search
  if (q) {
    query = query.ilike("userEmail", `%${q}%`);
  }

  // Apply filter
  if (status) {
    query = query.eq("status", status);
  }

  const { data: requests, count, error } = await query;

  if (error) {
    console.error("Failed to load license requests:", error);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">License Requests</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded border">

        {/* Search */}
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search by email..."
            defaultValue={q}
            className="border px-3 py-2 rounded text-sm"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
            Search
          </button>
        </form>

        {/* Status Filter */}
        <form className="flex gap-2">
          <select
            name="status"
            defaultValue={status}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button className="px-3 py-2 bg-gray-700 text-white rounded text-sm">
            Apply
          </button>
        </form>

        {/* Sorting */}
        <form className="flex gap-2">
          <select
            name="sort"
            defaultValue={sort}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="requestedAt">Requested Date</option>
            <option value="productName">Product</option>
            <option value="userEmail">Email</option>
          </select>

          <select
            name="dir"
            defaultValue={dir}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          <button className="px-3 py-2 bg-gray-700 text-white rounded text-sm">
            Sort
          </button>
        </form>

        {/* Export CSV */}
        <Link
          href="/api/admin/license-requests/export"
          className="px-4 py-2 bg-green-600 text-white rounded text-sm"
        >
          Export CSV
        </Link>

        {/* Audit Log Viewer */}
        <Link
          href="/admin/audit-logs"
          className="px-4 py-2 bg-gray-700 text-white rounded text-sm"
        >
          Audit Logs
        </Link>
      </div>

      {/* Table */}
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Requested</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests?.map((req) => (
            <tr key={req.id}>
              <td className="p-2 border">{req.userEmail}</td>
              <td className="p-2 border">{req.productName}</td>
              <td className="p-2 border">
                {new Date(req.requestedAt).toLocaleString()}
              </td>
              <td className="p-2 border">
                <StatusBadge status={req.status} />
              </td>
              <td className="p-2 border">
                <Link
                  href={`/admin/license-requests/${req.id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          return (
            <Link
              key={pageNum}
              href={`?page=${pageNum}&q=${q}&status=${status}&sort=${sort}&dir=${dir}`}
              className={`px-3 py-1 border rounded ${
                pageNum === page ? "bg-blue-600 text-white" : ""
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
