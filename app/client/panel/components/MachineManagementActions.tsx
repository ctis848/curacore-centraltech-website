"use client";

import { useState } from "react";

function MachineManagementActions({ machineId }: { machineId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [newName, setNewName] = useState("");

  const handleAction = async (endpoint: string, body: any = {}) => {
    setLoading(true);
    setMessage(null);

    const res = await fetch(`/api/client/machines/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ machineId, ...body }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Action failed." });
      return;
    }

    setMessage({ type: "success", text: data.message || "Action completed successfully!" });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 mt-10 max-w-xl">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Machine Management
      </h3>

      {message && (
        <div
          className={`p-3 mb-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">

        <button
          onClick={() => handleAction("suspend")}
          disabled={loading}
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
        >
          {loading ? "Processing..." : "Suspend Machine"}
        </button>

        <div className="space-y-3">
          <label className="text-gray-700 dark:text-gray-300">Rename Machine</label>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
            placeholder="Enter new machine name"
          />

          <button
            onClick={() => handleAction("rename", { name: newName })}
            disabled={loading || !newName}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {loading ? "Processing..." : "Rename Machine"}
          </button>
        </div>

        <button
          onClick={() => handleAction("delete")}
          disabled={loading}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          {loading ? "Deleting..." : "Delete Machine"}
        </button>

      </div>
    </div>
  );
}

export default MachineManagementActions;
