// FILE: app/admin/licenses/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";

type LicenseRow = {
  id: string;
  license_key: string;
  status: string;
  activated_at: string | null;
  expires_at: string | null;
  clients: {
    email: string | null;
    name: string | null;
  }[] | null;
};

export default async function LicensesListPage() {
  const supabase = supabaseServer();

  const { data: licenses, error } = await supabase
    .from("licenses")
    .select(`
      id,
      license_key,
      status,
      activated_at,
      expires_at,
      clients:client_id (
        email,
        name
      )
    `)
    .order("activated_at", { ascending: false });

  if (error) {
    console.error("Error loading licenses:", error);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">All Licenses</h2>

      <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">Client</th>
            <th className="p-2">Email</th>
            <th className="p-2">License Key</th>
            <th className="p-2">Status</th>
            <th className="p-2">Activated</th>
            <th className="p-2">Expires</th>
          </tr>
        </thead>

        <tbody>
          {(licenses as LicenseRow[])?.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.clients?.[0]?.name ?? "—"}</td>
              <td className="p-2">{l.clients?.[0]?.email ?? "—"}</td>
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
        </tbody>
      </table>
    </div>
  );
}
