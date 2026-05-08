// FILE: app/api/admin/licenses/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ FIXED

// =========================
// GET — Fetch all licenses
// =========================
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("License")
    .select("*, User(email)")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

// =========================
// PATCH — Update license status
// =========================
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body as { id: string; status: string };

  const { data, error } = await supabaseAdmin
    .from("License")
    .update({
      status,
      updatedAt: new Date().toISOString(), // ⭐ recommended for consistency
      updatedBy: "ADMIN",                  // ⭐ matches other admin routes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
