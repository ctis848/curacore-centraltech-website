// FILE: app/api/auth/admin-logout/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = supabaseServer();

  // Sign out admin
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
