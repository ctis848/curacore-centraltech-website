import { supabaseServer } from "@/lib/supabase/server";

export default async function AuditLogs({ requestId }: { requestId: string }) {
  const supabase = supabaseServer();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, details, created_at")
    .eq("details", `Approved license request #${requestId}`)
    .order("created_at", { ascending: false });

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-gray-500">
        No audit logs for this request.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h2 className="text-lg font-semibold">Audit Logs</h2>

      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="border-b pb-2">
            <p className="font-medium">{log.action}</p>
            <p className="text-sm text-gray-600">{log.details}</p>
            <p className="text-xs text-gray-400">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
