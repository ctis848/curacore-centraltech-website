import React from "react";

interface AnalyticsProps {
  totalCount: number;
  totalAmount: number;
}

export default function Analytics({ totalCount, totalAmount }: AnalyticsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-4">
      <div className="px-4 py-3 bg-white border rounded shadow-sm">
        <p className="text-xs text-slate-500">Total Records (Filtered)</p>
        <p className="text-lg font-semibold">{totalCount}</p>
      </div>
      <div className="px-4 py-3 bg-white border rounded shadow-sm">
        <p className="text-xs text-slate-500">Total Amount (Filtered)</p>
        <p className="text-lg font-semibold">
          ₦{totalAmount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
