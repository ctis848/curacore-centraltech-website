"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Machine {
  id: string;
  device_id: string;      // Machine Key from EMR
  company_id: string;
  active: boolean;
  created_at: string;
  companies: {
    name: string;
  } | null;
}

export default function AdminMachineDetailsPage({ params }: any) {
  const supabase = supabaseBrowser();
  const machineId = params.id;

  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);

  function getActivationAge(date: string) {
    const now = new Date();
    const act = new Date(date);
    const diff = now.getTime() - act.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  useEffect(() => {
    loadMachine();
  }, []);

  async function loadMachine() {
    const { data, error } = await supabase
      .from("machines")
      .select("*, companies(name)")
      .eq("id", machineId)
      .single();

    if (error) console.error(error);

    setMachine(data || null);
    setLoading(false);
  }

  if (loading)
    return (
      <p className="p-6 text-lg text-slate-600 animate-pulse">
        Loading machine details…
      </p>
    );

  if (!machine)
    return (
      <p className="p-6 text-lg text-red-600">
        Machine not found.
      </p>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Machine Details
      </h1>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">

        <div className="space-y-3 text-slate-700 text-lg">
          <p><strong>Machine ID:</strong> {machine.id}</p>
          <p><strong>Machine Key:</strong> {machine.device_id}</p>
          <p><strong>Company:</strong> {machine.companies?.name ?? "Unknown"}</p>
          <p><strong>Activated On:</strong> {new Date(machine.created_at).toLocaleString()}</p>
          <p><strong>Activation Age:</strong> {getActivationAge(machine.created_at)}</p>
          <p>
            <strong>Status:</strong>{" "}
            {machine.active ? (
              <span className="text-green-600 font-bold">Active</span>
            ) : (
              <span className="text-red-600 font-bold">Inactive</span>
            )}
          </p>
        </div>

        {/* ADMIN ACTIONS */}
        <div className="flex gap-4 mt-6">
          <button
            className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
          >
            Deactivate Machine
          </button>

          <button
            className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
          >
            Activate Machine
          </button>
        </div>

      </div>

      {/* OPTIONAL TRANSFER HISTORY */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h2 className="text-xl font-bold mb-3">Transfer History</h2>
        <p className="text-slate-600">No transfer history available.</p>
      </div>

    </div>
  );
}
