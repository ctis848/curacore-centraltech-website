import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseAdmin;

  const { data } = await supabase
    .from("LicenseRequest")
    .select("*")
    .order("requestedAt", { ascending: false });

  const rows = data ?? [];

  const csv =
    "id,userEmail,productName,requestedAt,status,notes,requestKey\n" +
    rows
      .map((r) =>
        [
          r.id,
          r.userEmail,
          r.productName,
          r.requestedAt,
          r.status,
          JSON.stringify(r.notes || ""),
          r.requestKey,
        ].join(",")
      )
      .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=license_requests.csv",
    },
  });
}
