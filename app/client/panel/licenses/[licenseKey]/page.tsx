"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LicenseDetails from "@/app/client/panel/components/LicenseDetails";

export default function LicenseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = params?.licenseKey;

    // Validate param existence
    if (!key) {
      setError("Missing license key in URL.");
      setLoading(false);
      return;
    }

    // Validate type
    if (typeof key !== "string") {
      setError("Invalid license key format.");
      setLoading(false);
      return;
    }

    // Basic format check
    if (key.length < 10) {
      setError("License key format is invalid.");
      setLoading(false);
      return;
    }

    setLicenseKey(key);
    setLoading(false);
  }, [params]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">
        <div className="animate-pulse">Loading license details…</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-4">
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            Go Back
          </button>

          <button
            onClick={() => location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Valid license key → show details
  return (
    <div className="p-6">
      <LicenseDetails licenseKey={licenseKey!} />
    </div>
  );
}
