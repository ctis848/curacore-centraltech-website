"use client";

import { useRouter } from "next/navigation";
import {
  FiLayers,
  FiClock,
  FiArchive,
  FiCpu,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";

import { Sparklines, SparklinesLine } from "react-sparklines";

export default function OverviewCards() {
  const router = useRouter();

  const cards = [
    {
      title: "Active Licenses",
      value: 12,
      icon: <FiLayers size={26} />,
      href: "/client/panel/active-licenses",
      color: "text-green-600 dark:text-green-300",
      chart: [5, 8, 12, 10, 14, 18, 22],
    },
    {
      title: "Pending Licenses",
      value: 3,
      icon: <FiClock size={26} />,
      href: "/client/panel/licenses/pending",
      color: "text-yellow-600 dark:text-yellow-300",
      chart: [3, 4, 3, 5, 4, 3, 3],
    },
    {
      title: "Expired Licenses",
      value: 5,
      icon: <FiArchive size={26} />,
      href: "/client/panel/licenses/expired",
      color: "text-red-600 dark:text-red-300",
      chart: [2, 3, 4, 5, 5, 6, 5],
    },
    {
      title: "Machines",
      value: 8,
      icon: <FiCpu size={26} />,
      href: "/client/panel/machines",
      color: "text-blue-600 dark:text-blue-300",
      chart: [4, 6, 7, 8, 7, 9, 8],
    },
    {
      title: "Invoices",
      value: 14,
      icon: <FiFileText size={26} />,
      href: "/client/panel/invoices",
      color: "text-teal-600 dark:text-teal-300",
      chart: [10, 12, 14, 13, 15, 16, 14],
    },
    {
      title: "Support Tickets",
      value: 2,
      icon: <FiHelpCircle size={26} />,
      href: "/client/panel/support",
      color: "text-purple-600 dark:text-purple-300",
      chart: [1, 2, 1, 3, 2, 2, 2],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {cards.map((card) => (
        <button
          key={card.title}
          onClick={() => router.push(card.href)}
          className="
            bg-white dark:bg-gray-800 border dark:border-gray-700
            p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300
            flex flex-col gap-4 group
          "
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {card.value}
              </h3>
            </div>

            <div
              className={`
                p-3 rounded-lg bg-gray-100 dark:bg-gray-700
                group-hover:scale-110 transition-transform duration-300
                ${card.color}
              `}
            >
              {card.icon}
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-2">
            <Sparklines data={card.chart} width={100} height={30}>
              <SparklinesLine color="#0d9488" />
            </Sparklines>
          </div>
        </button>
      ))}
    </div>
  );
}
