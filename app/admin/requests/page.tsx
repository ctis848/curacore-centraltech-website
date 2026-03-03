"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Request {
  id: string;
  client_id: string;
  request_key: string;
  created_at: string;
}

interface Client {
  id: string;
  contact_email: string | null;
  company_name: string | null;
}

export default function AdminRequestsPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [requests, setRequests] = useState<Request[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      // Admin check
      if (!user || user.email !== "info@ctistech.com") {
        router.push("/dashboard");
        return;
      }

      // Load pending requests
      const { data: reqData } = await supabase
        .from("license_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // Load clients
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, contact_email, company_name");

      setRequests(reqData || []);
      setClients(clientData || []);
      setLoading(false);
    }

    load();
  }, []);

  function getClientEmail(id: string) {
    return clients.find((c) => c.id === id)?.contact_email || "Unknown";
  }

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pending Activation Requests</h1>

      {requests.length === 0 && <p>No pending requests.</p>}

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="p-4 bg-white shadow rounded border">
            <p><strong>Client:</strong> {getClientEmail(req.client_id)}</p>

            <p className="mt-3"><strong>Request Key:</strong></p>
            <pre className="bg-gray-100 p-3 rounded text-sm">{req.request_key}</pre>

            <p className="text-sm text-gray-600 mt-2">
              Submitted: {new Date(req.created_at).toLocaleString()}
            </p>

            <a
              href={`/admin/requests/${req.id}`}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
            >
              Review & Approve
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
