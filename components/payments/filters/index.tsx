import React from "react";

interface FiltersSidebarProps {
  open: boolean;
  onClose: () => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  gatewayFilter: string;
  setGatewayFilter: (v: string) => void;
  channelFilter: string;
  setChannelFilter: (v: string) => void;
  uniqueStatuses: string[];
  uniqueGateways: string[];
  uniqueChannels: string[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  minAmount: string;
  setMinAmount: (v: string) => void;
  maxAmount: string;
  setMaxAmount: (v: string) => void;
  setPresetDays: (days: number) => void;
  setPresetThisMonth: () => void;
  setPresetThisYear: () => void;
}

export default function FiltersSidebar({
  open,
  onClose,
  statusFilter,
  setStatusFilter,
  gatewayFilter,
  setGatewayFilter,
  channelFilter,
  setChannelFilter,
  uniqueStatuses,
  uniqueGateways,
  uniqueChannels,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  setPresetDays,
  setPresetThisMonth,
  setPresetThisYear,
}: FiltersSidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-end bg-black/30 z-50">
      <div className="w-80 bg-white h-full shadow-xl p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Status
            </label>
            <select
              className="w-full px-2 py-1 border rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s || ""}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Gateway
            </label>
            <select
              className="w-full px-2 py-1 border rounded"
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
            >
              <option value="ALL">All Gateways</option>
              {uniqueGateways.map((g) => (
                <option key={g} value={g || ""}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Channel
            </label>
            <select
              className="w-full px-2 py-1 border rounded"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="ALL">All Channels</option>
              {uniqueChannels.map((c) => (
                <option key={c} value={c || ""}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Date Range
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  onClick={() => setPresetDays(7)}
                  className="px-2 py-1 text-xs bg-slate-200 rounded"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setPresetDays(30)}
                  className="px-2 py-1 text-xs bg-slate-200 rounded"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={setPresetThisMonth}
                  className="px-2 py-1 text-xs bg-slate-200 rounded"
                >
                  This Month
                </button>
                <button
                  onClick={setPresetThisYear}
                  className="px-2 py-1 text-xs bg-slate-200 rounded"
                >
                  This Year
                </button>
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="px-2 py-1 text-xs bg-slate-100 rounded"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Amount Range
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Min:</span>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Max:</span>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded"
                />
              </div>
              <button
                onClick={() => {
                  setMinAmount("");
                  setMaxAmount("");
                }}
                className="px-2 py-1 text-xs bg-slate-100 rounded self-start"
              >
                Clear Amount
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-slate-200 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
