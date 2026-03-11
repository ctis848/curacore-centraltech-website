"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { exportToCSV } from "@/lib/export-csv";
import { exportToPDF } from "@/lib/export-pdf";
import { columns } from "./columns";

type Invoice = {
  id: number;
  amount: number;
  quantity: number;
  billing_period: string;
  reference: string;
  description: string;
  email: string;
  plan: string;
  product_name: string;
  currency: string;
  status: string;
  created_at: string;
  paid_at: string | null;
};

export default function InvoiceHistoryPage() {
  const supabase = createSupabaseClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading invoices:", error);
        return;
      }

      if (data) {
        setInvoices(data as Invoice[]);
      }
    }

    loadInvoices();
  }, [supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoice History</h1>

      <DataTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onExportCSV={() => exportToCSV("invoices.csv", invoices)}
        onExportPDF={() => exportToPDF("invoices.pdf", invoices)}
      />

      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
