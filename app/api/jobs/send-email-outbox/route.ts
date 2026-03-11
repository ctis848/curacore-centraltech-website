import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: emails } = await supabase
    .from("outbox_emails")
    .select("*")
    .is("sent_at", null)
    .limit(20);

  if (!emails || emails.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  for (const email of emails) {
    await sendMail({
      to: email.to_email,
      subject: email.subject,
      html: email.html,
    });

    await supabase
      .from("outbox_emails")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", email.id);
  }

  return NextResponse.json({ processed: emails.length });
}
