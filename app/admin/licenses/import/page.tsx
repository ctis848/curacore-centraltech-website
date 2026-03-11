"use client";

import { useState } from "react";

export default function ImportLicensesPage() {
  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;

    const text = await file.text();
    const json = JSON.parse(text);

    await fetch("/api/admin/licenses/import", {
      method: "POST",
      body: JSON.stringify({ licenses: json }),
    });

    alert("Import complete");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Import Licenses</h1>

      <input
        type="file"
        accept="application/json"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="border p-2 rounded"
      />

      <button
        onClick={upload}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
      >
        Import
      </button>
    </div>
  );
}
