import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const body = await req.json();
  const { subject, message } = body;

  if (!subject || !message) {
    return NextResponse.json(
      { error: "subject and message are required" },
      { status: 400 }
    );
  }

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create support ticket
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject,
    message,
    status: "open",
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
