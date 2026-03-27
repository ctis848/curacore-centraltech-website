"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  License: {
    productName: string | null;
    licenseKey: string | null;
  } | null;
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTickets() {
    setLoading(true);
    const res = await fetch("/api/client/support");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/client/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        licenseId: licenseId || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create ticket");
    } else {
      setSubject("");
      setMessage("");
      setLicenseId("");
      await loadTickets();
    }

    setSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <section className="max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Support</h1>
        <p className="text-slate-500 mb-4">
          Create a support ticket and we&apos;ll get back to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
              placeholder="Describe your issue briefly"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 min-h-[120px]"
              placeholder="Provide as much detail as possible..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              License ID (optional)
            </label>
            <input
              type="text"
              value={licenseId}
              onChange={(e) => setLicenseId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
              placeholder="Link this ticket to a license"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">My Tickets</h2>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : tickets.length === 0 ? (
          <p className="text-slate-500">No tickets yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">License</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-2 max-w-xs">
                      <div className="truncate">{t.subject}</div>
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-2">
                      {t.License ? (
                        <div className="flex flex-col">
                          <span>{t.License.productName || "License"}</span>
                          <span className="font-mono text-xs text-slate-500">
                            {t.License.licenseKey}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Not linked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/client/support/${t.id}`}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    OPEN: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-sky-100 text-sky-700",
    RESOLVED: "bg-emerald-100 text-emerald-700",
    CLOSED: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
