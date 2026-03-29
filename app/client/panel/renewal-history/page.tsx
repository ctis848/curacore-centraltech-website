export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabaseServer } from "@/lib/supabase/server";

async function getHistory() {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("license_renewal_history")
    .select("license_id, action, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function RenewalHistoryPage() {
  const history = await getHistory();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Renewal History</h1>

      {history.length === 0 && <p>No renewal activity yet.</p>}

      <ul className="space-y-2">
        {history.map((h: any) => (
          <li key={h.created_at} className="border p-3 rounded bg-white">
            <div className="text-sm text-gray-600">
              {new Date(h.created_at).toLocaleString()}
            </div>

            <div className="font-medium">
              {h.action === "renewed"
                ? "License renewed"
                : h.action === "auto_revoked"
                ? "License auto‑revoked"
                : h.action === "reminder_sent"
                ? "Reminder sent"
                : h.action}
            </div>

            <div className="text-xs text-gray-500">
              License: {h.license_id}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
