"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Machine = {
  id: string;
  device_name: string;
  device_id: string;
  status: string;
  last_active: string | null;
};

export default function MachineHistoryPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // ← NEW: prevent early redirect

  useEffect(() => {
    async function load() {
      // Wait for auth state to initialize
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Give the client a moment to sync session (common Supabase delay)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Re-check user after delay
      const { data: refreshed } = await supabase.auth.getUser();

      if (!refreshed.user) {
        router.replace("/auth/client/login");
        return;
      }

      // User is confirmed → fetch machines
      const { data } = await supabase
        .from("machines")
        .select("*")
        .eq("user_id", refreshed.user.id)
        .order("last_active", { ascending: false });

      setMachines(data || []);
      setLoading(false);
      setIsAuthChecked(true);
    }

    load();

    // Listen for auth state changes (handles edge cases)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace("/auth/client/login");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (!isAuthChecked) {
    return <div className="min-h-screen flex items-center justify-center">Checking authentication...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Machine History</h1>

      <p className="text-gray-600 dark:text-gray-400">
        Below is a list of devices that have accessed your licenses.
      </p>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading machine history...</p>
      ) : machines.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          No machines found. This device may not have been registered yet.
        </p>
      ) : (
        <div className="space-y-4">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="p-5 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-teal-700 dark:text-teal-300">
                {machine.device_name}
              </h2>

              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <strong>Device ID:</strong> {machine.device_id}
              </p>

              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    machine.status === "active"
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  {machine.status}
                </span>
              </p>

              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <strong>Last Active:</strong>{" "}
                {machine.last_active
                  ? new Date(machine.last_active).toLocaleString()
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}