import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = supabaseAdmin;
  const form = await req.formData();

  const ids = form.getAll("ids") as string[];
  const action = form.get("action");

  if (ids.length === 0) {
    return NextResponse.json({ error: "No items selected" }, { status: 400 });
  }

  const status = action === "approve" ? "APPROVED" : "REJECTED";

  await supabase
    .from("LicenseRequest")
    .update({ status })
    .in("id", ids);

  await supabase.from("AuditLog").insert({
    id: crypto.randomUUID(),
    action: "BULK_UPDATE",
    details: `${action} ${ids.length} license requests`,
  });

  return NextResponse.redirect("/admin/license-requests");
}
