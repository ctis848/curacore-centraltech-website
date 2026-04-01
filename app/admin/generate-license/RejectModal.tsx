"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ModalState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

export default function RejectModal({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    message: "",
    type: "success",
  });

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  // Close modal on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setModal((m) => ({ ...m, open: false }));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeModal = () => {
    setModal((m) => ({ ...m, open: false }));
  };

  const submit = async () => {
    const trimmed = reason.trim();

    if (!trimmed || trimmed.length < 5) {
      return setModal({
        open: true,
        message: "Please provide a valid rejection reason (minimum 5 characters).",
        type: "error",
      });
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/license-requests/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: requestId, reason: trimmed }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Unexpected server response." };
      }

      if (!res.ok) {
        setModal({
          open: true,
          message: data.error || "Failed to reject request.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // Success
      setModal({
        open: true,
        message: "Request rejected successfully. Redirecting...",
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
      >
        Reject Request
      </button>

      {/* Reject Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-lg font-semibold text-gray-800">Reject Request</h2>

            <textarea
              ref={textareaRef}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
              rows={4}
              placeholder="Reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={submit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50 transition"
              >
                {loading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
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
