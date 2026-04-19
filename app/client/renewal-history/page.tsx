"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface RenewalRecord {
  id: string;
  amount: number;
  reference: string;
  paidAt: string;
  status: string;
  licenseCount: number;
}

export default function RenewalHistoryPage() {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      // ⭐ Correct query using snake_case columns
      const { data, error } = await supabase
        .from("AnnualPaymentHistory")
        .select(`
          id,
          amount,
          reference,
          status,
          paidAt:paidat,
          licenseCount:licensecount,
          userId:userid
        `)
        .eq("userid", user.id)
        .order("paidat", { ascending: false });

      if (error) {
        console.error("Error loading renewal history:", error);
        setLoading(false);
        return;
      }

      const mapped =
        data?.map((r: any) => ({
          id: r.id,
          amount: r.amount,
          reference: r.reference,
          paidAt: r.paidAt,
          status: r.status,
          licenseCount: r.licenseCount,
        })) || [];

      setRows(mapped);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Renewal History</h1>

      {loading && <p className="text-slate-500">Loading…</p>}

      {!loading && rows.length === 0 && (
        <p className="text-slate-500">No renewal records found.</p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full border">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Licenses</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {new Date(r.paidAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    ₦{Number(r.amount).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">{r.licenseCount}</td>

                  <td className="px-4 py-3 font-mono">{r.reference}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        r.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
