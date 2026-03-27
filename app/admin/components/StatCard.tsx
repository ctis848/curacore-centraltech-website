"use client";

import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  description?: string;
}

export default function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow rounded flex items-start gap-4">
      {icon}
      <div>
        <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-2xl font-bold">
          {value}
        </p>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
