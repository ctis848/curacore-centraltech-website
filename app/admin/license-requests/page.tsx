export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function LicenseRequestsPage() {
  const supabase = supabaseServer();

  const { data: requests, error } = await supabase
    .from("license_requests")
    .select(`
      id,
      request_key,
      status,
      created_at,
      clients:user_id (
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading requests:", error);
  }

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
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests?.map((r: any) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.clients?.name ?? "—"}</td>
              <td className="p-2">{r.clients?.email ?? "—"}</td>
              <td className="p-2 font-mono text-xs">{r.request_key}</td>
              <td className="p-2 capitalize">{r.status}</td>

              <td className="p-2 space-x-2">
                {r.status === "pending" && (
                  <>
                    <Link
                      href={`/admin/generate-license?request=${r.id}`}
                      className="px-3 py-1 bg-teal-600 text-white rounded"
                    >
                      Generate
                    </Link>

                    <form
                      action={`/admin/license-requests/${r.id}/reject`}
                      method="post"
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </form>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
