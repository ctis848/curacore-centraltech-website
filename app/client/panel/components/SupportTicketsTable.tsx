"use client";

import { useState, useEffect } from "react";

function SupportTicketsTable() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/support", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.tickets || []);
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    CLOSED: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <p className="text-gray-600 dark:text-gray-300">Loading support tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Support Tickets
        </h3>
        <p className="text-gray-600 dark:text-gray-300">You have no support tickets.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 mt-10">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Support Tickets
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Ticket ID</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Subject</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-3 px-4 text-gray-600 dark:text-gray-300">Created</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {ticket.ticketId}
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {ticket.subject}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColors[ticket.status] || "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                  {ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupportTicketsTable;
