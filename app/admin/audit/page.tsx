import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuditTrailsPage() {
  const supabase = supabaseServer();

  const { data: trails } = await supabase
    .from("audit_trails")
    .select("id, entity, entity_id, action, admin_id, timestamp")
    .order("timestamp", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Audit Trails</h2>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Entity</th>
            <th className="p-2 text-left">Entity ID</th>
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-left">Admin</th>
          </tr>
        </thead>
        <tbody>
          {trails?.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">
                {t.timestamp && new Date(t.timestamp).toLocaleString()}
              </td>
              <td className="p-2">{t.entity}</td>
              <td className="p-2 text-xs">{t.entity_id}</td>
              <td className="p-2">{t.action}</td>
              <td className="p-2 text-xs">{t.admin_id}</td>
            </tr>
          ))}
          {!trails?.length && (
            <tr>
              <td className="p-2 text-center text-slate-500" colSpan={5}>
                No audit records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
