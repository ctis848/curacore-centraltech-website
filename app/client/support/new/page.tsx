"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { FiSend } from "react-icons/fi";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-20 px-6 flex justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white text-center shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-wide">
            New Support Ticket
          </h1>
          <p className="mt-2 text-sm opacity-90">
            Tell us what you need help with
          </p>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm animate-fadeIn">
              Ticket submitted successfully.
            </div>
          )}

          {/* SUBJECT */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Subject *
            </label>
            <input
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 shadow-sm"
              placeholder="Short title for your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* PRIORITY */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Priority *
            </label>
            <select
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 shadow-sm"
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

          {/* MESSAGE */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Message *
            </label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 shadow-sm h-40"
              placeholder="Describe your issue in detail"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={submit}
            disabled={saving}
            className={`w-full py-4 text-lg font-bold rounded-xl text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:brightness-110"
            }`}
          >
            {saving ? "Submitting…" : <>Submit Ticket <FiSend size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
