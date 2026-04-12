"use client";

import { useEffect, useState } from "react";

export default function GeoMapPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/geo-map");
        const json = await res.json();
        setStats(json.countryStats || {});
      } catch (e) {
        console.error("Failed to load geo map data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Geo Map</h1>

      {loading && <p>Loading map data...</p>}

      {!loading && stats && (
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Country Stats</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Country</th>
                <th className="p-2 text-left">Total Validations</th>
                <th className="p-2 text-left">Failed Attempts</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([country, data]: any) => (
                <tr key={country} className="border-t">
                  <td className="p-2">{country}</td>
                  <td className="p-2">{data.total}</td>
                  <td className="p-2">{data.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !stats && (
        <p>No geo data found.</p>
      )}
    </div>
  );
}
