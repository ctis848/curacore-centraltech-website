"use client";

import { ColumnDef } from "@tanstack/react-table";
import { rowSelectionColumn } from "@/components/data-table-row-select";

export const columns: ColumnDef<any>[] = [
  rowSelectionColumn,

  {
    accessorKey: "device_name",
    header: "Device Name",
  },
  {
    accessorKey: "device_id",
    header: "Device ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return status ? status : "Unknown";
    },
  },
  {
    accessorKey: "last_active",
    header: "Last Active",
    cell: ({ row }) =>
      row.original.last_active
        ? new Date(row.original.last_active).toLocaleString()
        : "—",
  },
];
