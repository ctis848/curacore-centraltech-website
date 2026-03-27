"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong
        </h1>

        <p className="text-gray-600">
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={reset}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
