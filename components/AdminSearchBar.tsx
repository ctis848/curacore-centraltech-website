"use client";

import { useState } from "react";

export default function AdminSearchBar() {
  const [query, setQuery] = useState("");

  function search() {
    window.location.href = `/admin/search?q=${query}`;
  }

  return (
    <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2">
      <input
        className="bg-transparent outline-none flex-1"
        placeholder="Search licenses, users, machines..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={search} className="ml-2 text-teal-600 font-bold">
        Go
      </button>
    </div>
  );
}
