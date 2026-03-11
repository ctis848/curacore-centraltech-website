"use client";

import { ColumnDef } from "@tanstack/react-table";
import { rowSelectionColumn } from "@/components/data-table-row-select";

export const columns: ColumnDef<any>[] = [
  rowSelectionColumn,

  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      const currency = row.original.currency || "";
      return `${amount} ${currency}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const created = row.original.created_at;
      return created ? new Date(created).toLocaleString() : "—";
    },
  },
  {
    accessorKey: "paid_at",
    header: "Paid",
    cell: ({ row }) => {
      const paid = row.original.paid_at;
      return paid ? new Date(paid).toLocaleString() : "Not Paid";
    },
  },
];
