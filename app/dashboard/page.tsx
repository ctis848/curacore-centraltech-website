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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-10 py-10 space-y-10">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-teal-800">
          Dashboard
        </h1>
        <p className="text-gray-700 text-sm sm:text-base">
          Welcome, <span className="font-semibold">{user.email}</span>
        </p>
      </div>

      {/* LICENSE CARD */}
      {license ? (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 space-y-5">

          <h2 className="text-xl sm:text-2xl font-bold text-teal-800">
            Your License
          </h2>

          <div className="space-y-2 text-gray-700 text-sm sm:text-base">
            <p>
              <strong>Plan:</strong> {license.plan.toUpperCase()}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  license.is_active
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {license.is_active ? "Active" : "Expired"}
              </span>
            </p>

            <p>
              <strong>Expires:</strong>{" "}
              {new Date(license.expires_at).toLocaleDateString()}
            </p>
          </div>

          {!license.is_active && (
            <a
              href="/renew"
              className="block w-full bg-red-600 text-white text-center py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-red-700 transition"
            >
              Renew Annual Service Fee
            </a>
          )}
        </div>
      ) : (
        <p className="text-gray-600 text-center text-sm sm:text-base">
          No license found.
        </p>
      )}
    </div>
  );
}
