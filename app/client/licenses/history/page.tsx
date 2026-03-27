"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  license: { key: string; productName: string };
};

export default function LicenseHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/client/licenses/history")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">License History</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">No history yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg px-4 py-3 text-sm">
              <p className="font-semibold">
                {item.action} — {item.license.productName}
              </p>
              <p className="font-mono text-xs text-slate-500">{item.license.key}</p>
              {item.details && (
                <p className="text-slate-500 mt-1">{item.details}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
