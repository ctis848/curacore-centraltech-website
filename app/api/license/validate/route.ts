import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
  const { licenseKey } = await req.json();

  if (!licenseKey) {
    return NextResponse.json(
      { error: "Missing licenseKey" },
      { status: 400 }
    );
  }

  const { data: license, error } = await supabaseAdmin
    .from("licenses")
    .select("*")
    .eq("key", licenseKey)
    .single();

  if (error || !license) {
    return NextResponse.json(
      { valid: false, error: "License not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valid: true,
    status: license.status,
    license,
  });
}
