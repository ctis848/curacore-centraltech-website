"use client";

type MachineRow = {
  id: string;
  name: string;
  type: string;
  status: "Online" | "Offline" | "Suspended";
  lastActive: string;
};

const machines: MachineRow[] = [
  {
    id: "MCH-001",
    name: "Workstation Alpha",
    type: "Windows 11 Pro",
    status: "Online",
    lastActive: "2026-03-10 09:45",
  },
  {
    id: "MCH-002",
    name: "Server Node 3",
    type: "Ubuntu 22.04",
    status: "Offline",
    lastActive: "2026-03-09 22:10",
  },
  {
    id: "MCH-003",
    name: "Laptop Delta",
    type: "macOS Ventura",
    status: "Suspended",
    lastActive: "2026-03-08 14:30",
  },
];

const statusColors: Record<MachineRow["status"], string> = {
  Online: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Offline: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Suspended: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

export default function MachineTable() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Machine Management
        </h3>

        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition">
          + Add Machine
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Machine ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Name</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Type</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Last Active</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {machines.map((machine) => (
              <tr
                key={machine.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{machine.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{machine.name}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{machine.type}</td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[machine.status]}`}
                  >
                    {machine.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {machine.lastActive}
                </td>

                <td className="py-3 px-4">
                  <button className="text-red-600 dark:text-red-400 hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
