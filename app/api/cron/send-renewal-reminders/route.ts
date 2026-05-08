import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/sendEmail";
import { LicenseWithUser } from "@/app/types/licenseWithUser";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // Fetch all licenses with unpaid service fees
    const { data: licenses, error } = await supabase
      .from("licenses")
      .select(`
        id,
        renewal_due_date,
        service_fee_paid,
        userId:user_id,
        user:auth.users(email)
      `)
      .eq("service_fee_paid", false);

    if (error || !licenses) {
      return NextResponse.json(
        { error: "Failed to load licenses" },
        { status: 500 }
      );
    }

    const today = new Date();

    for (const license of licenses as unknown as LicenseWithUser[]) {
      if (!license.renewal_due_date) continue;

      const due = new Date(license.renewal_due_date);
      const diff = Math.ceil(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only send reminder exactly 7 days before due date
      if (diff === 7) {
        const reminderDate = due.toISOString().split("T")[0];

        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from("reminder_logs")
          .select("id")
          .eq("license_id", license.id)
          .eq("reminder_date", reminderDate)
          .maybeSingle();

        if (existingReminder) {
          // Skip duplicate reminders
          continue;
        }

        // Send email
        await sendEmail({
          to: license.user?.email ?? "",
          subject: "Your Annual Service Fee is Due Soon",
          html: `
            <p>Dear Client,</p>
            <p>Your 20% annual service fee for license <strong>${license.id}</strong> is due in <strong>7 days</strong>.</p>
            <p>Please log in to your dashboard to complete your renewal.</p>
            <p>Thank you.</p>
          `,
        });

        // Log reminder to prevent duplicates
        await supabase.from("reminder_logs").insert({
          license_id: license.id,
          user_id: license.userId, // ⭐ FIXED FIELD NAME
          reminder_date: reminderDate,
          sent_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Renewal reminder cron error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
