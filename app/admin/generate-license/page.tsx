"use client";

import { useEffect, useState } from "react";

export default function GenerateLicensePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");
  const [productName, setProductName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [maxActivations, setMaxActivations] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [error, setError] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);

  // Load clients
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/admin/clients", { cache: "no-store" });
        const data = await res.json();

        if (res.ok) {
          setClients(data.clients || []);
        } else {
          setError("Failed to load clients");
        }
      } catch {
        setError("Network error loading clients");
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  /* -------------------------
     SEND LICENSE FUNCTION
  ------------------------- */
  async function sendLicense() {
    setError("");
    setSubmitting(true);

    if (!clientId.trim()) {
      setSubmitting(false);
      return setError("Please select a client");
    }
    if (!productName.trim()) {
      setSubmitting(false);
      return setError("Product name is required");
    }
    if (!licenseKey.trim()) {
      setSubmitting(false);
      return setError("License key cannot be empty");
    }
    if (maxActivations && Number(maxActivations) < 0) {
      setSubmitting(false);
      return setError("Max activations cannot be negative");
    }

    const payload = {
      clientId,
      productName,
      licenseKey,
      maxActivations: maxActivations ? Number(maxActivations) : null,
      expiresAt: expiresAt || null,
    };

    const res = await fetch("/api/admin/licenses/send-to-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to send license");
      return;
    }

    setSuccessModal(true);

    // Reset form
    setClientId("");
    setProductName("");
    setLicenseKey("");
    setMaxActivations("");
    setExpiresAt("");
  }

  if (loading) return <p className="p-6">Loading clients...</p>;

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-3xl font-semibold">Send License</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Client Selection */}
      <div className="space-y-1">
        <label className="font-medium">Select Client</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">-- Select Client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.email} ({c.company || "No Company"})
            </option>
          ))}
        </select>

        {selectedClient && (
          <div className="text-sm text-gray-600 mt-1">
            <p>Email: {selectedClient.email}</p>
            <p>Company: {selectedClient.company || "N/A"}</p>

            <button
              onClick={() =>
                window.location.assign(`/admin/license-history/${selectedClient.id}`)
              }
              className="mt-2 text-blue-600 underline text-xs"
            >
              View License History →
            </button>
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="space-y-1">
        <label className="font-medium">Product Name</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. CentralTech ERP"
        />
      </div>

      {/* License Key */}
      <div className="space-y-1">
        <label className="font-medium">License Key</label>
        <textarea
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          className="w-full border rounded p-2 h-32"
          placeholder="Paste generated license key here..."
        />
      </div>

      {/* Max Activations */}
      <div className="space-y-1">
        <label className="font-medium">Max Activations (optional)</label>
        <input
          type="number"
          value={maxActivations}
          onChange={(e) => setMaxActivations(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. 3"
        />
      </div>

      {/* Expiry Date */}
      <div className="space-y-1">
        <label className="font-medium">Expiry Date (optional)</label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setPreviewOpen(true)}
          className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          Preview License
        </button>

        <button
          onClick={sendLicense}
          disabled={submitting}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send License"}
        </button>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <LicensePreviewModal
          onClose={() => setPreviewOpen(false)}
          client={selectedClient}
          productName={productName}
          licenseKey={licenseKey}
          maxActivations={maxActivations}
          expiresAt={expiresAt}
        />
      )}

      {/* Success Modal */}
      {successModal && <SuccessModal onClose={() => setSuccessModal(false)} />}
    </div>
  );
}

/* -------------------------
   LICENSE PREVIEW MODAL
------------------------- */
function LicensePreviewModal({
  onClose,
  client,
  productName,
  licenseKey,
  maxActivations,
  expiresAt,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl space-y-4">
        <h2 className="text-xl font-semibold">License Preview</h2>

        <div className="space-y-2 text-sm">
          <p><strong>Client:</strong> {client?.email}</p>
          <p><strong>Product:</strong> {productName}</p>
          <p><strong>Max Activations:</strong> {maxActivations || "Unlimited"}</p>
          <p><strong>Expires At:</strong> {expiresAt || "No Expiry"}</p>

          <div>
            <strong>License Key:</strong>
            <pre className="bg-gray-100 p-3 rounded mt-1 whitespace-pre-wrap">
              {licenseKey}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   SUCCESS MODAL
------------------------- */
function SuccessModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4 text-center">
        <h2 className="text-xl font-semibold text-green-700">
          License Sent Successfully
        </h2>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
