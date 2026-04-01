"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ModalState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

export default function ApproveForm({ requestId }: { requestId: string }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    message: "",
    type: "success",
  });

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const closeModal = () => {
    setModal((m) => ({ ...m, open: false }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = licenseKey.trim();

    if (!trimmed) {
      return setModal({
        open: true,
        message: "Please paste a valid license key.",
        type: "error",
      });
    }

    if (trimmed.length < 10) {
      return setModal({
        open: true,
        message: "License key format is invalid.",
        type: "error",
      });
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/licenses/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          license_key: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModal({
          open: true,
          message: data.error || "Failed to send license.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setModal({
        open: true,
        message: "License sent successfully. Redirecting...",
        type: "success",
      });

      setTimeout(() => {
        router.push("/admin/license-requests");
      }, 1500);
    } catch (err) {
      setModal({
        open: true,
        message: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || licenseKey.trim().length < 10;

  return (
    <>
      <form
        onSubmit={submit}
        className="space-y-4 bg-white p-5 rounded-lg shadow border border-gray-200"
      >
        <label className="block font-medium text-gray-700">
          Paste Generated License
        </label>

        <textarea
          ref={textareaRef}
          className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
          rows={5}
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste the generated license key here..."
          disabled={loading}
        />

        <button
          disabled={isButtonDisabled}
          className={`px-5 py-2 rounded-lg font-medium shadow transition ${
            isButtonDisabled
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {loading ? "Sending..." : "Send License"}
        </button>
      </form>

      {/* Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className={`font-medium ${
                modal.type === "error" ? "text-red-600" : "text-green-700"
              }`}
            >
              {modal.message}
            </p>

            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
