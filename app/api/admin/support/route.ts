// FILE: app/api/admin/support/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ FIXED

// =========================
// GET — Fetch all support tickets + replies
// =========================
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("SupportTicket")
    .select(`
      *,
      User(email),
      TicketReply(*, User(email))
    `)
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
// PATCH — Update ticket status
// =========================
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body as { id: string; status: string };

  const { data, error } = await supabaseAdmin
    .from("SupportTicket")
    .update({
      status,
      updatedAt: new Date().toISOString(), // ⭐ recommended for consistency
      processedBy: "ADMIN",                // ⭐ matches other admin routes
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
