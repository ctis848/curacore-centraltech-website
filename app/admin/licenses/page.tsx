"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Client {
  id: string;
  contact_email: string | null;
  company_name: string | null;
}

export default function AdminLicensesPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [productName, setProductName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [maxMachines, setMaxMachines] = useState(200);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      // Admin protection
      if (!user || user.email !== "info@ctistech.com") {
        router.push("/dashboard");
        return;
      }

      // Load clients
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, contact_email, company_name")
        .order("company_name", { ascending: true });

      setClients(clientData || []);
      setLoading(false);
    }

    load();
  }, []);

  function generateKey() {
    setLicenseKey(crypto.randomUUID().toUpperCase());
  }

  async function saveLicense() {
    setMessage("");

    if (!clientId || !productName || !licenseKey) {
      setMessage("All fields are required.");
      return;
    }

    await supabase.from("licenses").insert({
      client_id: clientId,
      product_name: productName,
      license_key: licenseKey,
      max_machines: maxMachines,
      machines_used: 0,
      status: "active",
      start_date: new Date().toISOString(),
      end_date: null,
    });

    setMessage("License created successfully.");
    setProductName("");
    setLicenseKey("");
    setClientId("");
  }

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create License</h1>

      {message && (
        <p className="mb-4 text-green-600 font-medium">{message}</p>
      )}

      <div className="bg-white p-6 shadow rounded border">

        <label className="block mb-1 font-semibold">Select Client</label>
        <select
          className="w-full p-3 border rounded mb-4"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">Choose client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name || c.contact_email}
            </option>
          ))}
        </select>

        <label className="block mb-1 font-semibold">Product Name</label>
        <input
          className="w-full p-3 border rounded mb-4"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />

        <label className="block mb-1 font-semibold">License Key</label>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 p-3 border rounded"
            value={licenseKey}
            readOnly
          />
          <button
            onClick={generateKey}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Generate
          </button>
        </div>

        <label className="block mb-1 font-semibold">Max Machines</label>
        <input
          type="number"
          className="w-full p-3 border rounded mb-6"
          value={maxMachines}
          onChange={(e) => setMaxMachines(Number(e.target.value))}
        />

        <button
          onClick={saveLicense}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save License
        </button>
      </div>
    </div>
  );
}
