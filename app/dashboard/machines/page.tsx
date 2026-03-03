"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface MachineActivation {
  id: string;
  license_id: string;
  machine_id: string;
  machine_name: string;
  activated_at: string;
  deactivated_at: string | null;
  status: string;
}

interface License {
  id: string;
  product_name: string;
  license_key: string;
}

export default function MachineHistoryPage() {
  const supabase = createSupabaseClient();

  const [machines, setMachines] = useState<MachineActivation[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMachines() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all licenses for this client
      const { data: licenseData } = await supabase
        .from("licenses")
        .select("id, product_name, license_key")
        .eq("client_id", user.id);

      if (licenseData) {
        setLicenses(licenseData);
      }

      // Load all machine activations for these licenses
      const licenseIds = licenseData?.map((l) => l.id) || [];

      if (licenseIds.length > 0) {
        const { data: machineData } = await supabase
          .from("license_activations")
          .select("*")
          .in("license_id", licenseIds)
          .order("activated_at", { ascending: false });

        if (machineData) {
          setMachines(machineData);
        }
      }

      setLoading(false);
    }

    loadMachines();
  }, []);

  if (loading) {
    return <p className="p-6">Loading machine history...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Machine History</h1>

      {machines.length === 0 && (
        <p className="text-gray-600">No machine activations found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((machine) => {
          const license = licenses.find((l) => l.id === machine.license_id);

          return (
            <div
              key={machine.id}
              className="p-5 bg-white shadow rounded border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">
                {license?.product_name || "Unknown Product"}
              </h2>

              <p className="text-sm text-gray-700">
                <strong>License Key:</strong> {license?.license_key}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Machine ID:</strong> {machine.machine_id}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Machine Name:</strong> {machine.machine_name}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Activated:</strong>{" "}
                {new Date(machine.activated_at).toLocaleString()}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    machine.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {machine.status.toUpperCase()}
                </span>
              </p>

              {machine.deactivated_at && (
                <p className="text-sm text-gray-700">
                  <strong>Deactivated:</strong>{" "}
                  {new Date(machine.deactivated_at).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
