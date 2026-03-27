"use client";

import { useState } from "react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubject("");
    setMessage("");
    alert("Support ticket submitted (demo).");
  };

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Support</h1>
      <p className="text-sm text-gray-600">
        Submit a ticket and our team will contact you.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-white"
        />

        <textarea
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-white h-32"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}
