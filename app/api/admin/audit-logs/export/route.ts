import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseAdmin;

  const { data } = await supabase
    .from("AuditLog")
    .select("*")
    .order("createdAt", { ascending: false });

  const rows = data ?? [];

  const csv =
    "id,action,details,userId,createdAt\n" +
    rows
      .map((r) =>
        [
          r.id,
          r.action,
          JSON.stringify(r.details || ""),
          r.userId || "",
          r.createdAt,
        ].join(",")
      )
      .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=audit_logs.csv",
    },
  });
}
