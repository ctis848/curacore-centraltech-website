"use client";

import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AnalyticsPage() {
  const supabase = supabaseAdmin;

  let counts = null;

  try {
    const { data } = await supabase.rpc("license_request_stats");
    counts = data ?? { total: 0, approved: 0, rejected: 0 };
  } catch (e) {
    counts = { total: 0, approved: 0, rejected: 0 };
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded shadow">
          <h2 className="text-sm text-gray-600">Total Requests</h2>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>

        <div className="p-4 bg-white border rounded shadow">
          <h2 className="text-sm text-gray-600">Approved</h2>
          <p className="text-2xl font-bold">{counts.approved}</p>
        </div>

        <div className="p-4 bg-white border rounded shadow">
          <h2 className="text-sm text-gray-600">Rejected</h2>
          <p className="text-2xl font-bold">{counts.rejected}</p>
        </div>
      </div>
    </div>
  );
}
