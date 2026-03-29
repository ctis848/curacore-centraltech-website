// FILE: app/api/admin/notifications/mark-read/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
