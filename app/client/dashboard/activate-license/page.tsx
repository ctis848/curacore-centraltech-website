"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { exportToCSV } from "@/lib/export-csv";
import { exportToPDF } from "@/lib/export-pdf";
import { columns } from "./columns";

type License = {
  id: string;
  plan: string;
  is_active: boolean;
  activated_at: string | null;
  expires_at: string | null;
  renewal_status: string | null;
  machine_limit: number | null;
};

export default function ActiveLicensesPage() {
  const supabase = createSupabaseClient();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadLicenses() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", user.id)
        .order("activated_at", { ascending: false });

      if (error) {
        console.error("Error loading licenses:", error);
        return;
      }

      if (data) {
        setLicenses(data as License[]);
      }
    }

    loadLicenses();
  }, [supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Active Licenses</h1>

      <DataTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onExportCSV={() => exportToCSV("active-licenses.csv", licenses)}
        onExportPDF={() => exportToPDF("active-licenses.pdf", licenses)}
      />

      <DataTable columns={columns} data={licenses} />
    </div>
  );
}
