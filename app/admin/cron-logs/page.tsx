import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 0; // always fetch fresh logs

export default async function CronLogsPage() {
  const { data: logs } = await supabaseAdmin
    .from("cron_logs")
    .select("*")
    .order("run_time", { ascending: false });

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Cron Job Logs</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Run Time</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Companies Notified</th>
              <th className="p-3 border">Message</th>
              <th className="p-3 border">Error</th>
            </tr>
          </thead>

          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-3 border">
                  {new Date(log.run_time).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })}
                </td>

                <td
                  className={`p-3 border font-semibold ${
                    log.status === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {log.status}
                </td>

                <td className="p-3 border">{log.companies_notified}</td>
                <td className="p-3 border">{log.message}</td>
                <td className="p-3 border text-red-500">
                  {log.error ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
