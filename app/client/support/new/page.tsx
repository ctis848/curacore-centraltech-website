"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function NewSupportTicketPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError(null);
    setSuccess(false);

    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
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
        .from("SupportTicket")
        .insert({
          id: crypto.randomUUID(),
          userId: user.id,
          subject: subject.trim(),
          message: message.trim(),
          priority,
          status: "OPEN",
          createdAt: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        setError("Failed to submit ticket. Please try again.");
        setSaving(false);
        return;
      }

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/client/support");
      }, 1200);
    } catch (err) {
      console.error("Unexpected ticket error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        New Support Ticket
      </h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded">
          Ticket submitted successfully.
        </p>
      )}

      <div className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            className="w-full rounded border p-2"
            placeholder="Short title for your issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            className="w-full rounded border p-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={saving}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full rounded border p-2"
            rows={6}
            placeholder="Describe your issue in detail"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={saving}
          />
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Submit Ticket"}
        </button>
      </div>
    </div>
  );
}
