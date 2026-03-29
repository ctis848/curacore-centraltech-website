"use client";

import { useState } from "react";

type License = {
  license_key: string;
  status: string;
  expires_at: string | null;
};

export default function ViewLicenseModal({ license }: { license: License }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-slate-300 rounded text-xs"
      >
        View
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96 space-y-3">
            <h2 className="text-lg font-bold">License Details</h2>

            <p><strong>Key:</strong> {license.license_key}</p>
            <p><strong>Status:</strong> {license.status}</p>
            <p><strong>Expires:</strong> {license.expires_at}</p>

            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 bg-slate-900 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
