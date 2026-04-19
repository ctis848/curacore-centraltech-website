"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ApproveTransferPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const supabase = supabaseBrowser();
  const [reqData, setReqData] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("LicenseTransferRequest")
      .select("*")
      .eq("id", id)
      .single();

    setReqData(data);
  }

  async function approve() {
    if (!reqData) return;

    // update license owner
    await supabase
      .from("License")
      .update({
        userEmail: reqData.newUserEmail,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", reqData.licenseId);

    // mark transfer approved
    await supabase
      .from("LicenseTransferRequest")
      .update({ status: "APPROVED" })
      .eq("id", id);

    router.replace("/admin/transfers");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Approve Transfer</h1>

      {reqData && (
        <div className="bg-white shadow p-4 rounded space-y-2">
          <p><strong>License:</strong> {reqData.licenseId}</p>
          <p><strong>From:</strong> {reqData.oldUserEmail}</p>
          <p><strong>To:</strong> {reqData.newUserEmail}</p>
          <p><strong>Status:</strong> {reqData.status}</p>

          <button
            onClick={approve}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Approve Transfer
          </button>
        </div>
      )}
    </div>
  );
}
