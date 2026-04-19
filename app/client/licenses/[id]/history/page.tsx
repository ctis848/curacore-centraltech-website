"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LicenseActivationHistoryPage() {
  const params = useParams();
  const id = params.id as string;

  const supabase = supabaseBrowser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("LicenseActivationHistory")
      .select("*")
      .eq("licenseId", id)
      .order("activatedAt", { ascending: false });

    if (!error) setHistory(data);
    setLoading(false);
  }

  if (loading) return <p>Loading activation history…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Activation History</h1>

      {history.length === 0 && <p>No activation history found.</p>}

      <div className="space-y-3">
        {history.map((h) => (
          <div key={h.id} className="bg-white shadow rounded p-4">
            <p><strong>Machine ID:</strong> {h.machineId}</p>
            <p><strong>IP Address:</strong> {h.ipAddress}</p>
            <p><strong>Activated At:</strong> {h.activatedAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
