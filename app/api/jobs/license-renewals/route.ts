import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();

  // 1) Find licenses expiring in next 7 days (reminder)
  const sevenDays = new Date();
  sevenDays.setDate(now.getDate() + 7);

  const { data: dueSoon } = await supabase
    .from("licenses")
    .select("id, user_id, expires_at")
    .eq("status", "active")
    .lte("expires_at", sevenDays.toISOString())
    .gte("expires_at", now.toISOString());

  // 2) Find licenses already expired
  const { data: expired } = await supabase
    .from("licenses")
    .select("id, user_id, machine_id, license_key")
    .eq("status", "active")
    .lt("expires_at", now.toISOString());

  // Send reminders
  if (dueSoon && dueSoon.length > 0) {
    for (const lic of dueSoon) {
      const { data: user } = await supabase
        .from("auth.users")
        .select("email")
        .eq("id", lic.user_id)
        .single();

      if (!user) continue;

      await sendMail({
        to: user.email,
        subject: "License renewal due in 7 days",
        html: `
          <p>Your license will expire on ${new Date(
            lic.expires_at
          ).toLocaleDateString()}.</p>
          <p>Please pay the 20% annual service fee to keep it active.</p>
        `,
      });
    }
  }

  // Deactivate expired
  if (expired && expired.length > 0) {
    for (const lic of expired) {
      await supabase
        .from("licenses")
        .update({ status: "expired" })
        .eq("id", lic.id);

      // history
      await supabase.from("license_history").insert({
        license_id: lic.id,
        event: "expired",
        timestamp: new Date().toISOString(),
        machine_id: lic.machine_id,
        details: { reason: "service_fee_not_paid" },
      });
    }
  }

  return NextResponse.json({
    reminders: dueSoon?.length || 0,
    expired: expired?.length || 0,
  });
}
