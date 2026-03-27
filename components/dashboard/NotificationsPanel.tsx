"use client";

type NotificationItem = {
  id: number;
  text: string;
};

const notifications: NotificationItem[] = [
  { id: 1, text: "Your license LIC-001 will expire soon." },
  { id: 2, text: "New invoice INV-1002 is available." },
  { id: 3, text: "Machine MCH-002 is offline." },
];

export default function NotificationsPanel({ open }: { open: boolean }) {
  return (
    <div
      className={`
        fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl
        border dark:border-gray-700 p-4 transition-all duration-300
        ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
    >
      <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Notifications</h4>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200"
          >
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
