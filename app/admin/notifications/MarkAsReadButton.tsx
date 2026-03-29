// FILE: app/admin/notifications/MarkAsReadButton.tsx
"use client";

export default function MarkAsReadButton({ id }: { id: string }) {
  async function markRead() {
    await fetch("/api/admin/notifications/mark-read", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    window.location.reload();
  }

  return (
    <button
      onClick={markRead}
      className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
    >
      Mark as Read
    </button>
  );
}
