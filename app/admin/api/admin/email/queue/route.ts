// FILE: app/api/admin/email/queue/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { to_email, subject, body } = await req.json();
  const supabase = supabaseServer();

  const { error } = await supabase.from("email_queue").insert({
    to_email,
    subject,
    body,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
