import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { licenseId, newEmail } = await req.json();

  const supabase = supabaseServer();

  const { data: license } = await supabase
    .from("License")
    .select("*")
    .eq("id", licenseId)
    .single();

  if (!license) {
    return NextResponse.json({ success: false, error: "License not found" });
  }

  await supabase.from("LicenseTransferRequest").insert({
    id: crypto.randomUUID(),
    licenseId,
    oldUserEmail: license.userEmail,
    newUserEmail: newEmail,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
