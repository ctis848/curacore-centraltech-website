'use client';

import { useEffect, useState } from 'react';

type Subscription = {
  id: string;
  plan: string;
  status: string;
  reference: string | null;
  created_at: string;
  current_period_end: string | null;
};

function exportCSV(rows: any[], filename = 'subscriptions.csv') {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SubscriptionsPage() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at.desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const limit = 10;

  const load = async (p = 1) => {
    try {
      setLoading(true);
      setError('');
      setSelected([]);

      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
        sort,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/my-subscriptions?${params}`, {
        next: { revalidate: 30 },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load subscriptions.');
        return;
      }

      setItems(Array.isArray(data?.items) ? data.items : []);
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
  }, [search, sort]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === items.length) {
      setSelected([]);
    } else {
      setSelected(items.map((i) => i.id));
    }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    await fetch('/api/subscriptions/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: selected }),
      headers: { 'Content-Type': 'application/json' },
    });
    load(page);
  };

  const bulkCancel = async () => {
    if (!selected.length) return;
    await fetch('/api/subscriptions/bulk-cancel', {
      method: 'POST',
      body: JSON.stringify({ ids: selected }),
      headers: { 'Content-Type': 'application/json' },
    });
    load(page);
  };

  const deleteOne = async (id: string) => {
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
    load(page);
  };

  const cancelOne = async (id: string) => {
    await fetch(`/api/subscriptions/${id}/cancel`, { method: 'POST' });
    load(page);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-6">Subscriptions</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl border border-red-300">
          {error}
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by plan, reference, or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-teal-300 rounded-full px-4 py-2"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-teal-300 rounded-full px-4 py-2"
          >
            <option value="created_at.desc">Newest</option>
            <option value="created_at.asc">Oldest</option>
            <option value="plan.asc">Plan A → Z</option>
            <option value="plan.desc">Plan Z → A</option>
            <option value="status.asc">Status A → Z</option>
            <option value="status.desc">Status Z → A</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => exportCSV(items, 'subscriptions.csv')}
            className="px-4 py-2 border rounded-full text-teal-700"
            disabled={!items.length}
          >
            Export CSV
          </button>
          <a
            href="/api/export/subscriptions/pdf"
            className="px-4 py-2 bg-teal-700 text-white rounded-full"
          >
            Export PDF
          </a>
        </div>

        <span className="text-gray-600">Total: {total}</span>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden animate-pulse">
          <div className="h-10 bg-gray-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 border-t bg-gray-100" />
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.length === items.length && items.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((sub) => (
                <tr key={sub.id} className="border-t">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(sub.id)}
                      onChange={() => toggleOne(sub.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {new Date(sub.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{sub.plan}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{sub.reference || '—'}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      className="text-blue-600 text-sm"
                      onClick={() => alert(`View ${sub.id}`)}
                    >
                      View
                    </button>
                    {sub.status === 'active' && (
                      <button
                        className="text-yellow-600 text-sm"
                        onClick={() => cancelOne(sub.id)}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      className="text-red-600 text-sm"
                      onClick={() => deleteOne(sub.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk bar */}
      {!loading && selected.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg px-6 py-3 rounded-full flex gap-4 items-center">
          <span className="text-sm text-gray-700">
            {selected.length} selected
          </span>
          <button
            onClick={bulkCancel}
            className="text-yellow-700 text-sm font-semibold"
          >
            Cancel selected
          </button>
          <button
            onClick={bulkDelete}
            className="text-red-700 text-sm font-semibold"
          >
            Delete selected
          </button>
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
