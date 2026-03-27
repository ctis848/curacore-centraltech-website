"use client";

export default function SystemStatus() {
  const status = {
    label: "All Systems Operational",
    color: "bg-green-600",
  };

  return (
    <div
      className={`
        ${status.color} text-white px-6 py-3 rounded-xl shadow mb-6
        flex items-center justify-between
      `}
    >
      <span className="font-semibold">{status.label}</span>
      <span className="opacity-80 text-sm">Updated just now</span>
    </div>
  );
}
