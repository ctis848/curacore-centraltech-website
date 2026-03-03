"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface LicenseRequest {
  id: string;
  client_id: string;
  request_key: string;
  status: string;
  created_at: string;
}

interface Client {
  id: string;
  contact_email: string | null;
  company_name: string | null;
}

export default function ApproveRequestPage() {
  const supabase = createSupabaseClient();
  const params = useParams();
  const router = useRouter();

  const requestId = params.id as string;

  const [request, setRequest] = useState<LicenseRequest | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [productName, setProductName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
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

      // Load request
      const { data: reqData } = await supabase
        .from("license_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (!reqData) {
        setMessage("Request not found.");
        setLoading(false);
        return;
      }

      setRequest(reqData);

      // Load client
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", reqData.client_id)
        .single();

      setClient(clientData || null);
      setLoading(false);
    }

    load();
  }, [requestId]);

  function generateKey() {
    setLicenseKey(crypto.randomUUID().toUpperCase());
  }

  async function approve() {
    if (!productName || !licenseKey) {
      setMessage("Product name and license key are required.");
      return;
    }

    setMessage("Processing...");

    // 1. Create license
    await supabase.from("licenses").insert({
      client_id: request?.client_id,
      product_name: productName,
      license_key: licenseKey,
      max_machines: 200,
      machines_used: 0,
      status: "active",
      start_date: new Date().toISOString(),
      end_date: null,
    });

    // 2. Mark request completed
    await supabase
      .from("license_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    // 3. Email client
    await fetch("/api/send-license-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientEmail: client?.contact_email,
        licenseKey,
        productName,
      }),
    });

    setMessage("License created and emailed to client.");
  }

  if (loading) {
    return <p className="p-6">Loading request...</p>;
  }

  if (!request || !client) {
    return <p className="p-6 text-red-600">Request not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Approve Activation Request</h1>

      {message && (
        <p className="mb-4 text-green-600 font-medium">{message}</p>
      )}

      <div className="bg-white p-6 shadow rounded border">
        <p><strong>Client Email:</strong> {client.contact_email}</p>

        <p className="mt-4"><strong>Request Key:</strong></p>
        <pre className="bg-gray-100 p-3 rounded text-sm">
{request.request_key}
        </pre>

        <p className="text-sm text-gray-600 mt-2">
          Submitted: {new Date(request.created_at).toLocaleString()}
        </p>

        <label className="block mt-6 mb-1 font-semibold">Product Name</label>
        <input
          className="w-full p-3 border rounded"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />

        <label className="block mt-4 mb-1 font-semibold">License Key</label>
        <div className="flex gap-2">
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

        <button
          onClick={approve}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Approve & Send License
        </button>
      </div>
    </div>
  );
}
