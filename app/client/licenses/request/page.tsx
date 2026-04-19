"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

export default function LicenseRequestPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [requestKey, setRequestKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitRequest = async () => {
    setError(null);
    setSuccess(false);

    if (!requestKey.trim()) {
      setError("License Request Key is required.");
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
        .from("LicenseRequest")
        .insert({
          id: uuid(),          // ⭐ REQUIRED because id is TEXT PRIMARY KEY
          userId: user.id,     // TEXT → matches your User.id
          requestKey,
          status: "PENDING",
          productName: null,   // optional
          notes: null,         // optional
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        setError("Failed to submit request. Please try again.");
        return;
      }

      setSuccess(true);
      setRequestKey("");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        Request License Key
      </h1>

      <p className="text-sm text-slate-600">
        Paste your License Request Key below. Our admin team will generate and
        send your License Key shortly.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded">
          Request submitted successfully.
        </p>
      )}

      <textarea
        className="w-full rounded border p-2"
        rows={5}
        placeholder="Paste your License Request Key here"
        value={requestKey}
        onChange={(e) => setRequestKey(e.target.value)}
        disabled={saving}
      />

      <button
        onClick={submitRequest}
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Submitting…" : "Submit Request"}
      </button>
    </div>
  );
}
