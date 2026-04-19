import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await admin
    .from("License")
    .select("*, User(email)")
    .eq("status", "ACTIVE"); // adjust if you track fee status separately

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
