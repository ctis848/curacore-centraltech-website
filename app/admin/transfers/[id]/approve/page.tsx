"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ApproveTransferPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // ⭐ FIX: Guard against null
  if (!params?.id) {
    notFound();
  }

  const id = params.id;

  const supabase = supabaseBrowser();
  const [reqData, setReqData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequest();
  }, []);

  async function loadRequest() {
    const { data, error } = await supabase
      .from("LicenseTransferRequest")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setError("Failed to load transfer request.");
      return;
    }

    setReqData(data);
  }

  async function approve() {
    setSaving(true);

    const { error } = await supabase
      .from("LicenseTransferRequest")
      .update({ status: "APPROVED" })
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("Failed to approve transfer.");
      setSaving(false);
      return;
    }

    router.push("/admin/transfers");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Approve Transfer</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {reqData ? (
        <div className="space-y-3">
          <p><strong>License:</strong> {reqData.licenseId}</p>
          <p><strong>From:</strong> {reqData.userId}</p>
          <p><strong>To:</strong> {reqData.newUserEmail}</p>
          <p><strong>Status:</strong> {reqData.status}</p>

          <button
            onClick={approve}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Approving…" : "Approve Transfer"}
          </button>
        </div>
      ) : (
        <p>Loading…</p>
      )}
    </div>
  );
}
