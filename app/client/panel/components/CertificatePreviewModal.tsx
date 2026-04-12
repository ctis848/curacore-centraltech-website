"use client";

import { useEffect } from "react";

export default function CertificatePreviewModal({
  open,
  onClose,
  pdfUrl,
}: {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
}) {
  if (!open || !pdfUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] h-[90%] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Certificate Preview</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Close
          </button>
        </div>

        <iframe
          src={pdfUrl}
          className="w-full h-full border rounded"
        />
      </div>
    </div>
  );
}
