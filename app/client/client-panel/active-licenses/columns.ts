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
    header: "Activated",
    cell: ({ row }) =>
      row.original.activated_at
        ? new Date(row.original.activated_at).toLocaleString()
        : "—",
  },
  {
    accessorKey: "expires_at",
    header: "Expires",
    cell: ({ row }) =>
      row.original.expires_at
        ? new Date(row.original.expires_at).toLocaleDateString()
        : "—",
  },
];
