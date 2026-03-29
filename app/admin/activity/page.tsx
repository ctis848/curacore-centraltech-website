import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  const supabase = supabaseServer();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("id, action, details, created_at, admin_id, admin_users(name)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<any>(); // quick escape for TS

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Logs</h2>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Admin</th>
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((log: any) => (
            <tr key={log.id} className="border-t align-top">
              <td className="p-2">
                {log.created_at && new Date(log.created_at).toLocaleString()}
              </td>
              <td className="p-2">{log.admin_users?.name || log.admin_id}</td>
              <td className="p-2">{log.action}</td>
              <td className="p-2 text-xs">
                <pre className="whitespace-pre-wrap">
                  {log.details ? JSON.stringify(log.details, null, 2) : "-"}
                </pre>
              </td>
            </tr>
          ))}
          {!logs?.length && (
            <tr>
              <td className="p-2 text-center text-slate-500" colSpan={4}>
                No activity yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
