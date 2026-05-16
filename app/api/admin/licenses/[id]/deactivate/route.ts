import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  const licenseId = params.id;

  const { data: license } = await supabase
    .from("License")
    .select("*")
    .eq("id", licenseId)
    .single();

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  await supabase
    .from("License")
    .update({ status: "INACTIVE" })
    .eq("id", licenseId);

  await supabase.from("AuditLog").insert({
    id: crypto.randomUUID(),
    action: "LICENSE_DEACTIVATED",
    details: `License deactivated for ${license.userId}`,
    userId: license.userId,
  });

  return NextResponse.json({ success: true });
}
