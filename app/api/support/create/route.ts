import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const { subject, message } = body;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("support_tickets").insert({
    user_id: user?.id,
    subject,
    message,
    status: "open",
  }).select().single();

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ success: true, ticket: data });
}
