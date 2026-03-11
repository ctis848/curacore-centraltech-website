"use client";

import { useEffect, useState } from "react";

export default function DownloadLicensePage() {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/license/my-license-files");
      const data = await res.json();
      setFiles(data.files ?? []);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Download License File</h1>

      {files.length === 0 && <p>No license files available.</p>}

      {files.map((f) => (
        <div key={f.name} className="border p-4 rounded bg-white">
          <p><strong>File:</strong> {f.name}</p>
          <a
            href={f.url}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 inline-block mt-2"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
