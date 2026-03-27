"use client";

import { useEffect, useMemo, useState } from "react";
import RequireRole from "../components/RequireRole";

interface Theme {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

type SortKey = "name" | "active" | "createdAt";

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/admin/api/themes")
      .then((r) => r.json())
      .then((data) => setThemes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filteredSorted = useMemo(() => {
    let data = [...themes];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) => t.name.toLowerCase().includes(q));
    }

    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Safe date sorting
      if (sortKey === "createdAt") {
        const aDate = typeof aVal === "string" ? new Date(aVal).getTime() : 0;
        const bDate = typeof bVal === "string" ? new Date(bVal).getTime() : 0;
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Boolean sorting
      if (sortKey === "active") {
        const aBool = aVal ? 1 : 0;
        const bBool = bVal ? 1 : 0;
        return sortDir === "asc" ? aBool - bBool : bBool - aBool;
      }

      // String sorting
      const aStr = String(aVal ?? "").toLowerCase();
      const bStr = String(bVal ?? "").toLowerCase();
      if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [themes, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (loading) {
    return <p className="p-6 dark:text-white">Loading themes...</p>;
  }

  return (
    <RequireRole role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold dark:text-white">Themes</h1>

        <input
          type="text"
          placeholder="Search themes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />

        <div className="bg-white dark:bg-gray-900 shadow rounded p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="p-3 cursor-pointer" onClick={() => toggleSort("name")}>
                  Name
                </th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort("active")}>
                  Active
                </th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSorted.map((theme) => (
                <tr
                  key={theme.id}
                  className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3">{theme.name}</td>
                  <td className="p-3">{theme.active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    {theme.createdAt
                      ? new Date(theme.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireRole>
  );
}
