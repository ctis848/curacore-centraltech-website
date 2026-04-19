"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function TransferRequestsPage() {
  const supabase = supabaseBrowser();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("LicenseTransferRequest")
      .select("*")
      .eq("oldUserEmail", user.email)
      .order("createdAt", { ascending: false });

    if (!error) setRequests(data);
    setLoading(false);
  }

  if (loading) return <p>Loading transfer requests…</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transfer Requests</h1>

      {requests.length === 0 && <p>No transfer requests found.</p>}

      <div className="overflow-x-auto border rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left">License</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">To</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="px-4 py-2">{req.licenseId}</td>
                <td className="px-4 py-2">{req.oldUserEmail}</td>
                <td className="px-4 py-2">{req.newUserEmail}</td>
                <td className="px-4 py-2">{req.status}</td>
                <td className="px-4 py-2">
                  {new Date(req.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
