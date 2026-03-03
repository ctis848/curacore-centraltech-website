'use client';

import { useEffect, useState } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at.desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 10;

  const load = async (p = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
        sort,
      });

      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/my-invoices?${params}`, {
        next: { revalidate: 30 }, // server-side caching
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load invoices.');
        return;
      }

      setInvoices(Array.isArray(data?.items) ? data.items : []);
      setTotal(typeof data?.total === 'number' ? data.total : 0);
      setPage(typeof data?.page === 'number' ? data.page : 1);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [status, search, sort]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-6">Invoices</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl border border-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by ID or Plan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-teal-300 rounded-full px-4 py-2"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-teal-300 rounded-full px-4 py-2"
        >
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-teal-300 rounded-full px-4 py-2"
        >
          <option value="created_at.desc">Newest</option>
          <option value="created_at.asc">Oldest</option>
          <option value="amount.desc">Amount (High → Low)</option>
          <option value="amount.asc">Amount (Low → High)</option>
          <option value="status.asc">Status A → Z</option>
          <option value="status.desc">Status Z → A</option>
        </select>

        <span className="text-gray-600">Total: {total}</span>
      </div>

      {/* Skeleton Loader */}
      {loading && (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden animate-pulse">
          <div className="h-10 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 border-t bg-gray-100"></div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="px-6 py-4">
                    {new Date(inv.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{inv.product_name || inv.plan}</td>
                  <td className="px-6 py-4">
                    ₦{inv.amount?.toLocaleString()} {inv.currency}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : inv.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/api/invoice/pdf?id=${inv.id}`}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="px-4 py-2 border rounded-full disabled:opacity-40"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="px-4 py-2 border rounded-full disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
