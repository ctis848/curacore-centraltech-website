"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
}

export default function DashboardCard({
  title,
  value,
  color = "text-blue-600 dark:text-blue-400",
  icon,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="
        p-6 rounded-xl shadow-sm border 
        bg-white dark:bg-gray-800 
        border-gray-200 dark:border-gray-700 
        transition-all duration-300
        hover:shadow-md
      "
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>

        {icon && (
          <div className="text-gray-400 dark:text-gray-300 text-2xl">
            {icon}
          </div>
        )}
      </div>

      <p className={`text-4xl font-bold mt-3 ${color}`}>{value}</p>
    </motion.div>
  );
}
