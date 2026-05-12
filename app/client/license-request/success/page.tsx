"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LicenseRequestSuccessPage() {
  const params = useSearchParams();

  const productName = params?.get("product") ?? "Unknown Product";
  const requestKey = params?.get("key") ?? "N/A";
  const timestamp = params?.get("time")
    ? new Date(params.get("time")!).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold text-green-700 mt-10">
        License Request Sent Successfully
      </h1>

      <p className="text-slate-600 mt-2 text-center max-w-xl">
        Your request has been submitted to our licensing team. You will receive
        an email once your license key has been generated and approved.
      </p>

      {/* Success Box */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8 w-full max-w-lg border border-green-300">
        <h2 className="text-xl font-semibold mb-4">Request Details</h2>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-slate-700">Product:</span>
            <p className="text-slate-900">{productName}</p>
          </div>

          <div>
            <span className="font-medium text-slate-700">License Request Key:</span>
            <p className="font-mono text-slate-900 break-all">{requestKey}</p>
          </div>

          <div>
            <span className="font-medium text-slate-700">Submitted At:</span>
            <p className="text-slate-900">{timestamp}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="font-semibold text-green-800">What happens next?</h3>
          <ul className="list-disc ml-5 mt-2 text-green-900 text-sm space-y-1">
            <li>Your request will be reviewed by an administrator.</li>
            <li>A license key will be generated for your machine.</li>
            <li>You will receive an email once the license is ready.</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/client/license-request"
            className="text-blue-600 hover:underline"
          >
            Submit Another Request
          </Link>

          <Link
            href="/client/licenses"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to My Licenses
          </Link>
        </div>
      </div>
    </div>
  );
}
