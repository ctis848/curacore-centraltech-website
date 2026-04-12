"use client";

import { useState } from "react";
import CertificatePreviewModal from "@/app/client/panel/components/CertificatePreviewModal";

export default function ViewCertificateButton({ licenseKey }: { licenseKey: string }) {
  const [open, setOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function openPreview() {
    const url = `/api/client/licenses/${licenseKey}/certificate`;
    setPdfUrl(url);
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={openPreview}
        className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm"
      >
        View Certificate
      </button>

      <CertificatePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        pdfUrl={pdfUrl}
      />
    </>
  );
}
