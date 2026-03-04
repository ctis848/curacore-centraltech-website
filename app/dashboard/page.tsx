"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [user, setUser] = useState<any>(null);
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/auth/login");
        return;
      }

      setUser(data.user);

      const licRes = await fetch("/api/license/get");
      const licData = await licRes.json();
      setLicense(licData);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-700">Welcome, {user.email}</p>

      {license ? (
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-2">Your License</h2>

          <p><strong>Plan:</strong> {license.plan.toUpperCase()}</p>
          <p><strong>Status:</strong> {license.is_active ? "Active" : "Expired"}</p>
          <p><strong>Expires:</strong> {new Date(license.expires_at).toLocaleDateString()}</p>

          {!license.is_active && (
            <a
              href="/renew"
              className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Renew Annual Service Fee
            </a>
          )}
        </div>
      ) : (
        <p className="text-gray-600">No license found.</p>
      )}
    </div>
  );
}
