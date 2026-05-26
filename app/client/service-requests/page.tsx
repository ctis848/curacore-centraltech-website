"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientServiceRequests() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("ServiceRequests")
        .select("*")
        .eq("email", session.user.email)
        .order("created_at", { ascending: false });

      setRequests(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 p-10 text-white">
          <h1 className="text-4xl font-extrabold">My Service Requests</h1>
          <p className="opacity-90 mt-2">Track all your on‑site support requests</p>
        </div>

        {/* BODY */}
        <div className="p-10">
          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-slate-500">No service requests yet.</p>
          ) : (
            <div className="space-y-6">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200"
                >
                  <h2 className="text-xl font-bold text-slate-800">
                    {req.serviceType}
                  </h2>
                  <p className="text-slate-600 mt-1">{req.description}</p>

                  <div className="mt-4 text-sm text-slate-500">
                    <p><strong>Status:</strong> {req.status}</p>
                    <p><strong>Location:</strong> {req.location}</p>
                    <p><strong>Date:</strong> {new Date(req.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
