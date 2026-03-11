"use client";

import { ColumnDef } from "@tanstack/react-table";
import { rowSelectionColumn } from "@/components/data-table-row-select";

export const columns: ColumnDef<any>[] = [
  // Row selection checkbox column
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
      const currency = row.original.currency;
      return `${amount} ${currency}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.created_at;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "paid_at",
    header: "Paid",
    cell: ({ row }) => {
      const paid = row.original.paid_at;
      return paid ? new Date(paid).toLocaleDateString() : "Not Paid";
    },
  },
];
