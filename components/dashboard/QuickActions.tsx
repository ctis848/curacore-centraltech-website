"use client";

import { useRouter } from "next/navigation";
import { FiKey, FiCpu, FiFileText, FiHelpCircle } from "react-icons/fi";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    { label: "Activate License", icon: <FiKey />, href: "/client/panel/licenses/activate" },
    { label: "Add Machine", icon: <FiCpu />, href: "/client/panel/machines" },
    { label: "View Invoices", icon: <FiFileText />, href: "/client/panel/invoices" },
    { label: "Open Support Ticket", icon: <FiHelpCircle />, href: "/client/panel/support" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => router.push(action.href)}
          className="
            bg-white dark:bg-gray-800 border dark:border-gray-700
            p-4 rounded-xl shadow hover:shadow-lg transition-all
            flex flex-col items-center gap-2
          "
        >
          <span className="text-2xl text-teal-600 dark:text-teal-300">{action.icon}</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
