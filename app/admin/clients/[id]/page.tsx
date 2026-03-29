// FILE: app/admin/clients/[id]/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";

export default async function ClientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseServer();
  const clientId = params.id;

  // Fetch client info
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email, created_at")
    .eq("id", clientId)
    .single();

  // Fetch licenses
  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, license_key, status, activated_at, expires_at")
    .eq("client_id", clientId)
    .order("activated_at", { ascending: false });

  // Fetch payments
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, currency, paid_at, status")
    .eq("client_id", clientId)
    .order("paid_at", { ascending: false });

  // Fetch license requests
  const { data: requests } = await supabase
    .from("license_requests")
    .select("id, request_key, status, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* CLIENT INFO */}
      <div className="bg-white p-6 rounded-lg shadow space-y-2">
        <h2 className="text-2xl font-bold">Client Details</h2>
        <p><span className="font-semibold">Name:</span> {client?.name ?? "—"}</p>
        <p><span className="font-semibold">Email:</span> {client?.email}</p>
        <p>
          <span className="font-semibold">Joined:</span>{" "}
          {client?.created_at
            ? new Date(client.created_at).toLocaleString()
            : "—"}
        </p>
      </div>

      {/* LICENSES */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Licenses</h3>

        <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">License Key</th>
              <th className="p-2">Status</th>
              <th className="p-2">Activated</th>
              <th className="p-2">Expires</th>
            </tr>
          </thead>

          <tbody>
            {licenses?.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2 font-mono text-xs">{l.license_key}</td>
                <td className="p-2 capitalize">{l.status}</td>
                <td className="p-2">
                  {l.activated_at
                    ? new Date(l.activated_at).toLocaleString()
                    : "—"}
                </td>
                <td className="p-2">
                  {l.expires_at
                    ? new Date(l.expires_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}

            {licenses?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No licenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAYMENTS */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Payments</h3>

        <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Amount</th>
              <th className="p-2">Currency</th>
              <th className="p-2">Status</th>
              <th className="p-2">Paid At</th>
            </tr>
          </thead>

          <tbody>
            {payments?.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 font-bold">
                  ₦{Number(p.amount).toLocaleString()}
                </td>
                <td className="p-2">{p.currency}</td>
                <td className="p-2 capitalize">{p.status}</td>
                <td className="p-2">
                  {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}

            {payments?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* LICENSE REQUESTS */}
      <div>
        <h3 className="text-xl font-semibold mb-2">License Requests</h3>

        <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Request Key</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>

          <tbody>
            {requests?.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 font-mono text-xs">{r.request_key}</td>
                <td className="p-2 capitalize">{r.status}</td>
                <td className="p-2">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}

            {requests?.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  No license requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
