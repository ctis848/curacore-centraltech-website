// FILE: app/api/admin/notifications/create/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { client_id, title, message } = await req.json();

  if (!client_id || !title || !message) {
    return NextResponse.json(
      { error: "client_id, title, and message are required" },
      { status: 400 }
    );
  }

  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("notifications").insert({
    client_id,
    title,
    message,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
