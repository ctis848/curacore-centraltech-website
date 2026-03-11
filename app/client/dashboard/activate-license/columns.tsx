"use client";

import { ColumnDef } from "@tanstack/react-table";
import { rowSelectionColumn } from "@/components/data-table-row-select";

export const columns: ColumnDef<any>[] = [
  rowSelectionColumn,

  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (row.original.is_active ? "Active" : "Inactive"),
  },
  {
    accessorKey: "renewal_status",
    header: "Renewal",
  },
  {
    accessorKey: "activated_at",
    header: "Activated",
    cell: ({ row }) =>
      row.original.activated_at
        ? new Date(row.original.activated_at).toLocaleDateString()
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
  {
    accessorKey: "machine_limit",
    header: "Machine Limit",
    cell: ({ row }) => row.original.machine_limit ?? "Unlimited",
  },
];
