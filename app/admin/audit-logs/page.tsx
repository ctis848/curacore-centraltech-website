import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AuditLogsPage() {
  const supabase = supabaseAdmin;

  const { data: logs } = await supabase
    .from("AuditLog")
    .select("*")
    .order("createdAt", { ascending: false });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Details</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Time</th>
          </tr>
        </thead>

        <tbody>
          {logs?.map((log) => (
            <tr key={log.id}>
              <td className="p-2 border">{log.action}</td>
              <td className="p-2 border">{log.details}</td>
              <td className="p-2 border">{log.userId || "System"}</td>
              <td className="p-2 border">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
