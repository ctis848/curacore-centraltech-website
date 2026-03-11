"use client";
import React from "react";
import { ColumnDef } from "@tanstack/react-table";

export type MachineRow = {
  id: string;
  device_name: string;
  device_id: string;
  status: string;
  last_active: string | null;
};

export const columns: ColumnDef<MachineRow>[] = [
  {
    accessorKey: "device_name",
    header: "Device Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 dark:text-gray-200">
        {row.original.device_name}
      </span>
    ),
  },

  {
    accessorKey: "device_id",
    header: "Device ID",
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-300">
        {row.original.device_id}
      </span>
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "active"
          ? "text-green-600"
          : status === "inactive"
          ? "text-gray-500"
          : "text-yellow-600";

      return <span className={`font-semibold ${color}`}>{status}</span>;
    },
  },

  {
    accessorKey: "last_active",
    header: "Last Active",
    cell: ({ row }) => {
      const value = row.original.last_active;
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {value ? new Date(value).toLocaleString() : "—"}
        </span>
      );
    },
  },
];
