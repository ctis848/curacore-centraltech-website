'use client';

import { useEffect, useState } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = async (p = 1, s = '') => {
    const params = new URLSearchParams({
      page: p.toString(),
      limit: limit.toString(),
    });
    if (s) params.set('status', s);

    const res = await fetch(`/api/my-invoices?${params}`);
    const data = await res.json();

    setInvoices(data.items);
    setTotal(data.total);
    setPage(data.page);
  };

  useEffect(() => {
    load(1, '');
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-6">Invoices</h1>

      {/* Filter */}
      <div className="flex justify-between mb-6">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            load(1, e.target.value);
          }}
          className="border border-teal-300 rounded-full px-4 py-2"
        >
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <span className="text-gray-600">Total: {total}</span>
      </div>

      {/* Table */}
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
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-t">
                <td className="px-6 py-4">
                  {new Date(inv.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">{inv.product_name || inv.plan}</td>
                <td className="px-6 py-4">
                  ₦{inv.amount.toLocaleString()} {inv.currency}
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

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => load(page - 1, status)}
          className="px-4 py-2 border rounded-full disabled:opacity-40"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => load(page + 1, status)}
          className="px-4 py-2 border rounded-full disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
