'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function LicenseHistoryPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [history, setHistory] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from('license_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error loading license history:', error);
        return;
      }

      setHistory(data || []);
      setFiltered(data || []);
      setHasMore(count ? to + 1 < count : false);
    };

    load();
  }, [user, page, supabase]);

  useEffect(() => {
    let result = [...history];

    if (search.trim() !== '') {
      const term = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.license_key.toLowerCase().includes(term) ||
          h.machine_id.toLowerCase().includes(term)
      );
    }

    if (sort === 'date_desc') {
      result.sort(
        (a, b) =>
          new Date(b.activated_at).getTime() -
          new Date(a.activated_at).getTime()
      );
    }

    if (sort === 'date_asc') {
      result.sort(
        (a, b) =>
          new Date(a.activated_at).getTime() -
          new Date(b.activated_at).getTime()
      );
    }

    setFiltered(result);
  }, [search, sort, history]);

  const exportCSV = () => {
    const rows = [
      ['License Key', 'Machine ID', 'Activated At'],
      ...filtered.map((h) => [
        h.license_key,
        h.machine_id,
        new Date(h.activated_at).toLocaleString(),
      ]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'license_history.csv';
    a.click();
  };

  if (!user) return <p className="mt-20 text-center">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-10">
        License Activation History
      </h1>

      {/* Search + Sort + Export */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search license history..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="date_desc">Date (Newest)</option>
          <option value="date_asc">Date (Oldest)</option>
        </select>

        <button
          onClick={exportCSV}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100">
        {filtered.length === 0 ? (
          <p>No license history found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3">License Key</th>
                <th className="py-3">Machine ID</th>
                <th className="py-3">Activated At</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b">
                  <td className="py-3">{h.license_key}</td>
                  <td className="py-3">{h.machine_id}</td>
                  <td className="py-3">
                    {new Date(h.activated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex justify-between mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? 'bg-gray-200 text-gray-400'
                : 'bg-teal-600 text-white'
            }`}
          >
            Previous
          </button>

          <button
            disabled={!hasMore}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg ${
              !hasMore
                ? 'bg-gray-200 text-gray-400'
                : 'bg-teal-600 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
