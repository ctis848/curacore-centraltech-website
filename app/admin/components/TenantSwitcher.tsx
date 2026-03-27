"use client";

import { useState, useEffect } from "react";

export default function TenantSwitcher() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/orgs")
      .then((res) => res.json())
      .then((data) => setOrgs(data))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      className="p-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded outline-none"
      disabled={loading}
    >
      {loading && <option>Loading organizations…</option>}

      {!loading && orgs.length === 0 && (
        <option>No organizations found</option>
      )}

      {!loading &&
        orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
    </select>
  );
}
