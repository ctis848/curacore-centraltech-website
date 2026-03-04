"use client";

import { X } from "lucide-react";

export default function NotificationsPanel({ open, setOpen }: any) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <button onClick={() => setOpen(false)}>
            <X size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto h-full">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <p className="font-semibold text-gray-900 dark:text-white">New License Request</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">A client submitted a new activation request.</p>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <p className="font-semibold text-gray-900 dark:text-white">License Approved</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">You approved a license for a client.</p>
          </div>
        </div>
      </div>
    </>
  );
}
