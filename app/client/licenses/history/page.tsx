"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type ActivationRow = {
  id: string;
  licenseId: string;
  machineId: string;
  created_at: string;
};

export default function LicenseHistoryPage() {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState<ActivationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data: activations, error } = await supabase
        .from("LicenseActivation")
        .select("id, licenseId, machineId, created_at")
        .eq("userId", user.id)
        .order("created_at", { ascending: false });

      if (!error && activations) {
        setRows(activations as ActivationRow[]);
      }

      setLoading(false);
    };

    load();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 text-slate-900">
        Activation History
      </h1>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">No activation history found.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <p className="font-medium">
                License: <span className="font-mono">{row.licenseId}</span>
              </p>
              <p className="text-sm text-slate-600">
                Machine: <span className="font-mono">{row.machineId}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(row.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
