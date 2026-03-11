import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export default async function MachineLogsPage() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: logs } = await supabase
    .from("machines")
    .select("machine_id, license_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Machine Logs</h1>

      {logs?.map((log) => (
        <div key={log.machine_id} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p><strong>Machine ID:</strong> {log.machine_id}</p>
          <p><strong>License:</strong> {log.license_id}</p>
          <p className="text-sm text-gray-500">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
