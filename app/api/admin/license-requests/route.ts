// FILE: app/api/admin/license-requests/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ FIXED

// =========================
// GET — Fetch all license requests
// =========================
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("LicenseRequest")
    .select("*")
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
// PATCH — Update license request status
// =========================
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body as { id: string; status: string };

  const { data, error } = await supabaseAdmin
    .from("LicenseRequest")
    .update({
      status,
      processedAt: new Date().toISOString(), // ⭐ recommended for consistency
      processedBy: "ADMIN",                  // ⭐ matches approve/reject routes
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
