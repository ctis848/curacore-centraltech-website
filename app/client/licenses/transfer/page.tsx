"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

export default function TransferLicensePage() {
  const params = useParams();

  // ⭐ FIX: Safe access without altering behavior
  const id = (params?.id as string) ?? "";

  const supabase = supabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitTransfer = async () => {
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Recipient email is required.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/client/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("LicenseTransferRequest")
        .insert({
          id: uuid(),
          userId: user.id,
          licenseId: id,
          newUserEmail: email,
          reason,
          status: "PENDING",
        });

      if (insertError) {
        console.error(insertError);
        setError("Failed to submit transfer request.");
        return;
      }

      setSuccess(true);
      setEmail("");
      setReason("");
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Transfer License</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded">
          Transfer request submitted successfully.
        </p>
      )}

      <input
        className="w-full rounded border p-2"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={saving}
      />

      <textarea
        className="w-full rounded border p-2"
        rows={3}
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={saving}
      />

      <button
        onClick={submitTransfer}
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Submitting…" : "Submit Transfer Request"}
      </button>
    </div>
  );
}
