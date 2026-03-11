"use client";

import { ColumnDef } from "@tanstack/react-table";
import { rowSelectionColumn } from "@/components/data-table-row-select";

export const columns: ColumnDef<any>[] = [
  rowSelectionColumn,

  {
    accessorKey: "license_key",
    header: "License Key",
  },
  {
    accessorKey: "machine_id",
    header: "Machine ID",
  },
  {
    accessorKey: "activated_at",
    header: "Activated At",
    cell: ({ row }) =>
      row.original.activated_at
        ? new Date(row.original.activated_at).toLocaleString()
        : "—",
  },
];
