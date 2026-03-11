"use client";

import { useState } from "react";

interface Machine {
  id: string;
  machine_id: string;
  status: string;
  last_seen: string | null;
  last_license_key: string | null;
}

export default function MachineDetailsModal({ machine }: { machine: Machine }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => setOpen(true)}
      >
        View Details
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">Machine Details</h2>

            <p><strong>ID:</strong> {machine.machine_id}</p>
            <p><strong>Status:</strong> {machine.status}</p>
            <p><strong>Last Seen:</strong> {machine.last_seen}</p>
            <p><strong>Last License:</strong> {machine.last_license_key}</p>

            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
