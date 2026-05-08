import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ Correct import

export async function GET() {
  // ❌ Wrong: admin.from(...)
  // const { data, error } = await admin.from("License")

  // ✅ Correct: supabaseAdmin.from(...)
  const { data, error } = await supabaseAdmin
    .from("License")
    .select("*, User(email)")
    .eq("status", "ACTIVE"); // adjust if you track fee status separately

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
