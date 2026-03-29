// FILE: app/api/admin/email/send/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { id } = await req.json();
  const supabase = supabaseServer();

  const { data: email } = await supabase
    .from("email_queue")
    .select("*")
    .eq("id", id)
    .single();

  if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  // TODO: integrate your email provider here
  console.log("Sending email:", email.subject);

  await supabase.from("email_queue").update({ sent: true }).eq("id", id);

  return NextResponse.json({ success: true });
}
