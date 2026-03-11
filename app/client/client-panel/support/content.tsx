"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { DataTableToolbar } from "@/components/data-table-toolbar";
import { exportToCSV } from "@/lib/export-csv";
import { exportToPDF } from "@/lib/export-pdf";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  user_id: string;
  ticket_id: string;
  subject: string;
  status: string;
  created_at: string;
};

export default function SupportPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/client/login");
        return;
      }

      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setTickets(data as Ticket[]);
    }

    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Support Tickets</h1>

      <DataTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onExportCSV={() => exportToCSV("support-tickets.csv", tickets)}
        onExportPDF={() => exportToPDF("support-tickets.pdf", tickets)}
      />

      <DataTable columns={columns} data={tickets} />
    </div>
  );
}
