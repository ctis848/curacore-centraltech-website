export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

async function getRequests() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data } = await supabase
    .from("license_renewal_history")
    .select("id, user_id, action, metadata, created_at")
    .eq("action", "activation_requested")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function ActivationRequestsPage() {
  const requests = await getRequests();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activation Requests</h1>

      {requests.length === 0 && (
        <p className="text-gray-600">No activation requests yet.</p>
      )}

      <div className="space-y-3">
        {requests.map((req: any) => (
          <div key={req.id} className="border p-4 rounded bg-white">
            <p>
              <strong>User ID:</strong> {req.user_id}
            </p>
            <p>
              <strong>Request Key:</strong>{" "}
              <span className="font-mono text-sm">
                {req.metadata?.request_key}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              {new Date(req.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
