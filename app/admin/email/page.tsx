import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmailNotificationsPage() {
  const supabase = supabaseServer();

  const { data: emails } = await supabase
    .from("email_queue")
    .select("id, to_email, subject, sent, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Email Notifications</h2>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">To</th>
            <th className="p-2 text-left">Subject</th>
            <th className="p-2 text-left">Sent</th>
            <th className="p-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {emails?.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.to_email}</td>
              <td className="p-2">{e.subject}</td>
              <td className="p-2">{e.sent ? "Yes" : "No"}</td>
              <td className="p-2">
                {e.created_at && new Date(e.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
          {!emails?.length && (
            <tr>
              <td className="p-2 text-center text-slate-500" colSpan={4}>
                No emails queued yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-xs text-slate-500">
        Emails are queued when licenses are approved. Sending logic will be
        wired in the API layer.
      </p>
    </div>
  );
}
