"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface License {
  id: string;
  product_name: string;
  license_key: string;
  max_machines: number;
  machines_used: number;
  status: string;
  start_date: string;
  end_date: string;
}

interface MachineActivation {
  id: string;
  license_id: string;
  machine_id: string;
  machine_name: string;
  activated_at: string;
  deactivated_at: string | null;
  status: string;
}

export default function LicenseDetailsPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const params = useParams();

  const licenseId = params?.id as string;

  const [license, setLicense] = useState<License | null>(null);
  const [machines, setMachines] = useState<MachineActivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDetails() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load license details
      const { data: licenseData } = await supabase
        .from("licenses")
        .select("*")
        .eq("id", licenseId)
        .eq("client_id", user.id)
        .single();

      if (licenseData) {
        setLicense(licenseData);
      }

      // Load machine activations for this license
      const { data: machineData } = await supabase
        .from("license_activations")
        .select("*")
        .eq("license_id", licenseId)
        .order("activated_at", { ascending: false });

      if (machineData) {
        setMachines(machineData);
      }

      setLoading(false);
    }

    loadDetails();
  }, [licenseId]);

  async function deactivateMachine(machineId: string) {
    setMessage("");

    const { error } = await supabase
      .from("license_activations")
      .update({
        status: "deactivated",
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", machineId);

    if (error) {
      setMessage("Failed to deactivate machine.");
      return;
    }

    setMessage("Machine deactivated successfully.");

    // Refresh machine list
    const { data: machineData } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", licenseId)
      .order("activated_at", { ascending: false });

    if (machineData) {
      setMachines(machineData);
    }
  }

  if (loading) {
    return <p className="p-6">Loading license details...</p>;
  }

  if (!license) {
    return <p className="p-6 text-red-600">License not found.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">License Details</h1>

      {message && (
        <p className="mb-4 text-green-600 font-medium">{message}</p>
      )}

      <div className="bg-white p-6 shadow rounded border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-3">{license.product_name}</h2>

        <p className="text-sm text-gray-700">
          <strong>License Key:</strong> {license.license_key}
        </p>

        <p className="text-sm text-gray-700">
          <strong>Status:</strong>{" "}
          <span
            className={
              license.status === "active"
                ? "text-green-600"
                : license.status === "expired"
                ? "text-red-600"
                : "text-gray-600"
            }
          >
            {license.status.toUpperCase()}
          </span>
        </p>

        <p className="text-sm text-gray-700">
          <strong>Machines:</strong> {license.machines_used} / {license.max_machines}
        </p>

        <p className="text-sm text-gray-700">
          <strong>Start Date:</strong> {license.start_date}
        </p>

        <p className="text-sm text-gray-700">
          <strong>End Date:</strong> {license.end_date}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Machines</h2>

      {machines.length === 0 && (
        <p className="text-gray-600">No machines activated for this license.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="p-5 bg-white shadow rounded border border-gray-200"
          >
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

            {machine.status === "active" && (
              <button
                onClick={() => deactivateMachine(machine.id)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              >
                Deactivate Machine
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
