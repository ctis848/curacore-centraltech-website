import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { licenseKey, machineId } = await req.json();

  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", licenseKey)
    .single();

  if (!license) {
    return NextResponse.json({ valid: false, reason: "Invalid license" });
  }

  if (license.status !== "active") {
    return NextResponse.json({ valid: false, reason: "License inactive" });
  }

  return NextResponse.json({ valid: true });
}
