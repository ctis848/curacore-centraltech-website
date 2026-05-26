"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientServiceInvoices() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("ServiceInvoices")
        .select("*, ServiceRequests(*)")
        .eq("ServiceRequests.email", session.user.email)
        .order("created_at", { ascending: false });

      setInvoices(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-10 text-white">
          <h1 className="text-4xl font-extrabold">Service Invoices</h1>
          <p className="opacity-90 mt-2">View and pay your service invoices</p>
        </div>

        {/* BODY */}
        <div className="p-10">
          {loading ? (
            <p className="text-center text-slate-500">Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-center text-slate-500">No invoices found.</p>
          ) : (
            <div className="space-y-6">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-6 bg-slate-100 rounded-xl shadow-sm border border-slate-200"
                >
                  <h2 className="text-xl font-bold text-slate-800">
                    Invoice #{inv.id}
                  </h2>

                  <p className="text-slate-600 mt-1">
                    {inv.ServiceRequests?.serviceType}
                  </p>

                  <div className="mt-4 text-sm text-slate-500">
                    <p><strong>Total:</strong> ₦{inv.total.toLocaleString()}</p>
                    <p><strong>Status:</strong> {inv.paid ? "PAID" : "UNPAID"}</p>
                    <p><strong>Date:</strong> {new Date(inv.created_at).toLocaleString()}</p>
                  </div>

                  {!inv.paid && (
                    <a
                      href={`/service/payment/callback?reference=${inv.reference}`}
                      className="inline-block mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition"
                    >
                      Pay Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
