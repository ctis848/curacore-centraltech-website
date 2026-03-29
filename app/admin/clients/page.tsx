// FILE: app/admin/clients/page.tsx
export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase/server";

export default async function ClientsListPage() {
  const supabase = supabaseServer();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Clients</h2>

      <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Joined</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients?.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name ?? "—"}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2">
                {c.created_at
                  ? new Date(c.created_at).toLocaleString()
                  : "—"}
              </td>
              <td className="p-2">
                <a
                  href={`/admin/clients/${c.id}`}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                >
                  View
                </a>
              </td>
            </tr>
          ))}

          {clients?.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-slate-500">
                No clients found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
