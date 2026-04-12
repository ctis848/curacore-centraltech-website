"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

type ActiveLicense = {
  id: string;
  license_key: string;
  product_name: string;
  expires_at: string | null;
  status: string;
};

export default function ActiveLicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<ActiveLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/licenses/active", {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/auth/client/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load active licenses");
        }

        const data = await res.json();
        setLicenses(data.licenses || []);
      } catch (err: any) {
        setError(err.message || "Unable to load licenses");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300">Loading active licenses…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Active Licenses</h1>
      <DataTable columns={columns} data={licenses} />
    </div>
  );
}
