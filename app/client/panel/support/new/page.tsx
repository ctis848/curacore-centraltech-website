"use client";

import { useState } from "react";

export default function NewSupportTicketPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function submitTicket() {
    const res = await fetch("/api/client/support/new", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Ticket created");
    window.location.href = "/client/client-panel/support";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Support Ticket</h1>

      <div className="space-y-3">
        <input
          className="input"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <textarea
          className="input h-40"
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={submitTicket}
          className="px-4 py-2 bg-teal-700 text-white rounded-lg"
        >
          Submit Ticket
        </button>
      </div>
    </div>
  );
}
