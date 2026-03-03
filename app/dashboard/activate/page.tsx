"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

// Simple validator for Windows-generated request keys
function validateRequestKey(key: string) {
  const pattern = /^[A-Z0-9\-]{20,200}$/; // adjust length if needed
  return pattern.test(key.trim());
}

export default function ActivateLicensePage() {
  const supabase = createSupabaseClient();

  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage("");

    if (!validateRequestKey(key)) {
      setMessage("Invalid request key format. Please check and try again.");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in.");
      setLoading(false);
      return;
    }

    // Save request in Supabase
    const { error } = await supabase.from("license_requests").insert({
      client_id: user.id,
      request_key: key.trim(),
      status: "pending",
    });

    if (error) {
      setMessage("Failed to submit request. Please try again.");
      setLoading(false);
      return;
    }

    // Send email to admin
    await fetch("/api/send-activation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: key.trim(),
        clientEmail: user.email,
      }),
    });

    setMessage("Your activation request has been sent successfully.");
    setKey("");
    setLoading(false);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Request License Activation</h1>

      {message && (
        <p className="mb-4 text-green-600 font-medium">{message}</p>
      )}

      <textarea
        className="w-full p-3 border rounded"
        rows={6}
        placeholder="Paste your License Request Key here"
        value={key}
        onChange={(e) => setKey(e.target.value.toUpperCase())}
      />

      <button
        onClick={submit}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Sending..." : "Send Activation Request"}
      </button>
    </div>
  );
}
