"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { exportToCSV } from "@/lib/export-csv";
import { exportToPDF } from "@/lib/export-pdf";
import { columns } from "./columns";

type LicenseHistory = {
  id: string;
  user_id: string;
  activated_at: string;
  license_key: string;
  machine_id: string;
};

export default function LicenseHistoryPage() {
  const supabase = createSupabaseClient();
  const [history, setHistory] = useState<LicenseHistory[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadHistory() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("license_history")
        .select("*")
        .eq("user_id", user.id)
        .order("activated_at", { ascending: false });

      if (error) {
        console.error("Error loading license history:", error);
        return;
      }

      if (data) {
        setHistory(data as LicenseHistory[]);
      }
    }

    loadHistory();
  }, [supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">License History</h1>

      <DataTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onExportCSV={() => exportToCSV("license-history.csv", history)}
        onExportPDF={() => exportToPDF("license-history.pdf", history)}
      />

      <DataTable columns={columns} data={history} />
    </div>
  );
}
