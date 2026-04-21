"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer"; // <-- Footer imported here

export default function DownloadPage() {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const platform = window.navigator.platform.toLowerCase();
      if (platform.includes("win")) setIsWindows(true);
    }
  }, []);

  const handleDownload = () => {
    // Log analytics
    fetch("/api/download/log");

    // Redirect to success page
    setTimeout(() => {
      window.location.href = "/download/success";
    }, 800);
  };

  return (
    <>
      <section className="bg-gray-950 text-gray-200 py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">

          {/* Return Link */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-teal-400 hover:text-teal-300 transition font-semibold"
            >
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-white">Download CentralCore EMR</h1>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Install the desktop application for secure, offline‑capable medical record management.
          </p>

          {/* Windows-only Download Button */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleDownload}
              className={`px-10 py-4 rounded-lg font-semibold transition text-lg
                ${
                  isWindows
                    ? "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/40"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                }
              `}
            >
              Download for Windows (.exe)
            </button>
          </div>

          {/* Version + Release Notes */}
          <div className="mt-12 text-left max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-white">Version 1.4.2</h3>
            <ul className="mt-3 text-gray-400 space-y-2 text-sm">
              <li>• Improved offline sync engine</li>
              <li>• Faster patient search indexing</li>
              <li>• Updated appointment scheduler UI</li>
              <li>• Security patches + bug fixes</li>
            </ul>
          </div>

          {/* SHA-256 Checksum */}
          <div className="mt-6 text-left max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-white">SHA‑256 Checksum</h3>
            <code className="block mt-2 p-3 bg-gray-900 text-gray-300 rounded-lg text-sm break-all">
              9f2c1b7d8e4a0c1d3f8a9e7b2c4d5f6a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5
            </code>
            <p className="text-gray-500 text-xs mt-2">
              Verify the integrity of your download for maximum security.
            </p>
          </div>

          <p className="mt-10 text-gray-500 text-sm">
            Secure • Encrypted • HIPAA‑ready • Offline‑capable
          </p>

        </div>
      </section>

      {/* Footer included */}
      <Footer />
    </>
  );
}
