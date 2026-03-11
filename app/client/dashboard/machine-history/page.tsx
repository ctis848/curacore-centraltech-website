"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { exportToCSV } from "@/lib/export-csv";
import { exportToPDF } from "@/lib/export-pdf";
import { columns } from "./columns";

type Machine = {
  id: string;
  user_id: string;
  device_name: string;
  device_id: string;
  last_active: string;
  status: string;
};

export default function MachineHistoryPage() {
  const supabase = createSupabaseClient();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadMachines() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .eq("user_id", user.id)
        .order("last_active", { ascending: false });

      if (error) {
        console.error("Error loading machines:", error);
        return;
      }

      if (data) {
        setMachines(data as Machine[]);
      }
    }

    loadMachines();
  }, [supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Machine History</h1>

      <DataTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onExportCSV={() => exportToCSV("machine-history.csv", machines)}
        onExportPDF={() => exportToPDF("machine-history.pdf", machines)}
      />

      <DataTable columns={columns} data={machines} />
    </div>
  );
}
