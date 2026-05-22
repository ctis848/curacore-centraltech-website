import React from "react";
import { UserDetails } from "@/app/admin/payments/page";

interface UserDrawerProps {
  open: boolean;
  user: UserDetails | null;
  onClose: () => void;
}

export default function UserDrawer({ open, user, onClose }: UserDrawerProps) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 flex justify-end bg-black/30 z-50">
      <div className="w-96 bg-white h-full shadow-xl p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">User Details</h2>

        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {user.created_at
            ? new Date(user.created_at).toLocaleString()
            : "—"}
        </p>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-slate-200 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
