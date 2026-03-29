"use client";

import { useState } from "react";

export default function ApproveLicenseModal({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleApprove() {
    setLoading(true);

    const res = await fetch("/api/admin/licenses/approve", {
      method: "POST",
      body: JSON.stringify({
        request_id: requestId,
        license_key: licenseKey,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  return (
    <>
      <button
        className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
        onClick={() => setOpen(true)}
      >
        Approve
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold">Approve License</h2>

            <input
              type="text"
              placeholder="Paste generated license key"
              className="w-full border p-2 rounded"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />

            {success && (
              <p className="text-green-600 text-sm">License approved successfully</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
