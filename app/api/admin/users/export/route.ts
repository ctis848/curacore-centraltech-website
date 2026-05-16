import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseAdmin;

  const { data } = await supabase
    .from("User")
    .select("*")
    .order("createdAt", { ascending: false });

  const rows = data ?? [];

  const csv =
    "id,email,name,tenantId,createdAt\n" +
    rows
      .map((r) =>
        [
          r.id,
          r.email,
          JSON.stringify(r.name || ""),
          r.tenantId || "",
          r.createdAt,
        ].join(",")
      )
      .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=users.csv",
    },
  });
}
