"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { exportToCSV } from "@/lib/export-csv";
import { exportToPDF } from "@/lib/export-pdf";
import { columns } from "./columns";

type LicenseRow = {
  id: string;
  product: string;
  status: string;
  expiry: string;
};

export default function LicenseTable() {
  const supabase = createSupabaseClient();
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadLicenses() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("licenses")
        .select("id, product, status, expiry")
        .eq("user_id", user.id)
        .order("expiry", { ascending: true });

      if (error) {
        console.error("Error loading licenses:", error);
        return;
      }

      if (data) {
        setLicenses(data as LicenseRow[]);
      }
    }

    loadLicenses();
  }, [supabase]);

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
        License Overview
      </h3>

      <DataTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onExportCSV={() => exportToCSV("licenses.csv", licenses)}
        onExportPDF={() => exportToPDF("licenses.pdf", licenses)}
      />

      <DataTable columns={columns} data={licenses} />
    </div>
  );
}
