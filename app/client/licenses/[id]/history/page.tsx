"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LicenseActivationHistoryPage() {
  // ⭐ Explicitly type params so TS knows the shape
  const params = useParams<{ id: string }>();

  // ⭐ Safe extraction
  const id = params?.id ?? null;

  const supabase = supabaseBrowser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; // ⭐ Guard against null
    loadHistory();
  }, [id]);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("LicenseActivationHistory")
      .select("*")
      .eq("licenseId", id)
      .order("activatedAt", { ascending: false });

    if (!error) setHistory(data);
    setLoading(false);
  }

  if (!id) {
    return <p className="text-red-600">Invalid license ID</p>;
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
