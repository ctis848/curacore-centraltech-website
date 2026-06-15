export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { LicenseSchema, LicenseType } from "@/lib/validation/licenseSchema";
import { sendRenewalReminderEmail } from "@/lib/email/sendRenewalReminder";

export async function GET() {
  return POST();
}

export async function POST() {
  const supabase = supabaseServer();

  try {
    await supabase.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "running",
      message: "Cron started",
    });

    const { data, error } = await supabase
      .from("licenses")
      .select(`
        id,
        user_id,
        auto_renew,
        renewal_due_date,
        service_fee_paid,
        active,
        annual_price,
        portal_password,
        company:companies(name, email)
      `);

    if (error) {
      throw new Error(error.message);
    }

    const licenses: LicenseType[] = [];

    // Validate each license with Zod
    for (const row of data || []) {
      const parsed = LicenseSchema.safeParse(row);
      if (parsed.success) licenses.push(parsed.data);
    }

    const today = new Date(new Date().toISOString().split("T")[0]);

    for (const lic of licenses) {
      if (!lic.auto_renew || !lic.renewal_due_date) continue;
      if (lic.active === false) continue;

      const due = new Date(lic.renewal_due_date);
      const dueDate = new Date(due.toISOString().split("T")[0]);

      const diffDays = (dueDate.getTime() - today.getTime()) / 86400000;

      const c = {
        name: lic.company?.name,
        renewal_date: lic.renewal_due_date,
        annual_price: lic.annual_price,
        portal_password: lic.portal_password,
      };

      const email = lic.company?.email;

      async function alreadySent(type: string) {
        const { data } = await supabase
          .from("renewal_reminder_history")
          .select("id")
          .eq("license_id", lic.id)
          .eq("reminder_type", type)
          .maybeSingle();

        return !!data;
      }

      async function logReminder(type: string) {
        await supabase.from("renewal_reminder_history").insert({
          license_id: lic.id,
          reminder_type: type,
        });

        await supabase.from("cron_logs").insert({
          job_name: "renewal_reminder",
          status: "info",
          message: `${type} reminder sent for license ${lic.id}`,
        });
      }

      // DAILY REMINDER (30 → 1 days)
      if (diffDays <= 30 && diffDays >= 1) {
        const reminderKey = `${diffDays}_day`;

        if (!(await alreadySent(reminderKey))) {
          await sendRenewalReminderEmail(c, email!, diffDays);
          await logReminder(reminderKey);
        }
      }

      // AUTO-REVOKE ON DUE DATE
      if (diffDays === 0 && !lic.service_fee_paid) {
        await supabase.from("license_renewal_history").insert({
          license_id: lic.id,
          user_id: lic.user_id,
          action: "auto_revoked",
          metadata: {},
        });

        await supabase.from("licenses").update({ active: false }).eq("id", lic.id);

        await supabase.from("cron_logs").insert({
          job_name: "renewal_reminder",
          status: "warning",
          message: `License auto-revoked: ${lic.id}`,
        });
      }
    }

    await supabase.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "success",
      message: "Cron completed successfully",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await supabase.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "error",
      message: err.message,
    });

    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
