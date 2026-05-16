import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseAdmin;

  const { data } = await supabase
    .from("License")
    .select("*")
    .order("createdAt", { ascending: false });

  const rows = data ?? [];

  const csv =
    "id,userId,productName,licenseKey,status,createdAt\n" +
    rows
      .map((r) =>
        [
          r.id,
          r.userId,
          r.productName,
          r.licenseKey,
          r.status,
          r.createdAt,
        ].join(",")
      )
      .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=licenses.csv",
    },
  });
}
