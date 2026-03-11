"use client";

import { ColumnDef } from "@tanstack/react-table";
import { rowSelectionColumn } from "@/components/data-table-row-select";

const statusColors: Record<string, string> = {
  Active: "text-green-600 dark:text-green-300",
  Expired: "text-red-600 dark:text-red-300",
  Pending: "text-yellow-600 dark:text-yellow-300",
};

export const columns: ColumnDef<any>[] = [
  rowSelectionColumn,

  {
    accessorKey: "id",
    header: "License ID",
  },
  {
    accessorKey: "product",
    header: "Product",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`font-semibold ${
            statusColors[status] || "text-gray-600 dark:text-gray-300"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "expiry",
    header: "Expiry Date",
    cell: ({ row }) =>
      row.original.expiry
        ? new Date(row.original.expiry).toLocaleDateString()
        : "—",
  },
];
