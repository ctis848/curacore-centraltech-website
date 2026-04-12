"use client";

interface DashboardCardProps {
  title: string;
  value: string | number;
  color?: string;
}

export default function DashboardCard({ title, value, color }: DashboardCardProps) {
  return (
    <div className="p-6 bg-white border rounded-lg shadow text-center space-y-2">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${color ?? "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}
