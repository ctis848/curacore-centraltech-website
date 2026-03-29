// FILE: app/admin/license-requests/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";
import ApproveLicenseModal from "./ApproveLicenseModal";

type LicenseRequestRow = {
  id: string;
  request_key: string;
  status: string;
  created_at: string;
  clients: {
    email: string | null;
    name: string | null;
  }[] | null;
};

export default async function LicenseRequestsPage() {
  const supabase = supabaseServer();

  const { data: requests } = await supabase
    .from("license_requests")
    .select("id, request_key, status, created_at, clients(email, name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">License Requests</h2>

      <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">Client</th>
            <th className="p-2">Email</th>
            <th className="p-2">Request Key</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {(requests as LicenseRequestRow[])?.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.clients?.[0]?.name ?? "—"}</td>
              <td className="p-2">{r.clients?.[0]?.email ?? "—"}</td>
              <td className="p-2 font-mono text-xs">{r.request_key}</td>
              <td className="p-2 capitalize">{r.status}</td>
              <td className="p-2">
                {new Date(r.created_at).toLocaleString()}
              </td>

              <td className="p-2 flex items-center gap-2">
                <button
                  className="px-2 py-1 text-xs bg-slate-200 rounded"
                  onClick={async () => {
                    await navigator.clipboard.writeText(r.request_key);
                  }}
                >
                  Copy Key
                </button>

                {r.status === "pending" && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/license-requests/${r.id}/approve`, {
                        method: "POST",
                      });
                      location.reload();
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
