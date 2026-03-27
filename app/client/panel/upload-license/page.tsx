"use client";

import { useState } from "react";

export default function UploadLicensePage() {
  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/license/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (data.success) alert("License uploaded.");
    else alert("Error: " + data.error);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Upload License File</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="border p-2 rounded w-full"
      />

      <button
        onClick={upload}
        className="px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700 w-full"
      >
        Upload
      </button>
    </div>
  );
}
