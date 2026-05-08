// FILE: app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ FIXED

// =========================
// GET — Fetch all users
// =========================
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("User")
    .select("id, email, role, createdAt")
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
// PATCH — Update user role
// =========================
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, role } = body as {
    id: string;
    role: "CLIENT" | "ADMIN" | "SUPERADMIN";
  };

  const { data, error } = await supabaseAdmin
    .from("User")
    .update({
      role,
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
