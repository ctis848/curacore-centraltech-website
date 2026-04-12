"use client";

import { useState } from "react";

export default function DownloadCertificateButton({
  licenseKey,
}: {
  licenseKey: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/client/licenses/${licenseKey}/certificate`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate certificate");
      }

      // Convert response to blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${licenseKey}.pdf`;
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Unable to download certificate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Download Certificate"}
      </button>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
