import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/sendEmail";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // 1️⃣ Load all companies with renewal dates
    const { data: companies, error } = await supabase
      .from("companies")
      .select("id, company_name, annual_fee, renewal_date");

    if (error || !companies) {
      return NextResponse.json(
        { error: "Failed to load companies" },
        { status: 500 }
      );
    }

    const today = new Date();

    for (const company of companies) {
      if (!company.renewal_date) continue;

      const renewalDate = new Date(company.renewal_date);
      const diffDays = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 2️⃣ Determine if reminder should be sent
      const shouldSend =
        diffDays === 30 ||
        diffDays === 7 ||
        diffDays === 1 ||
        diffDays === 0 ||
        diffDays < 0;

      if (!shouldSend) continue;

      const reminderDate = renewalDate.toISOString().split("T")[0];

      // 3️⃣ Prevent duplicate reminders
      const { data: existingReminder } = await supabase
        .from("reminder_logs")
        .select("id")
        .eq("company_id", company.id)
        .eq("reminder_date", reminderDate)
        .maybeSingle();

      if (existingReminder) continue;

      // 4️⃣ Get all users in this company
      const { data: profiles } = await supabase
        .from("Profile")
        .select("userid, fullname")
        .eq("company_id", company.id);

      if (!profiles) continue;

      // 5️⃣ Send email to each user
      for (const profile of profiles) {
        const { data: authUser } = await supabase.auth.admin.getUserById(
          profile.userid
        );

        const email = authUser?.user?.email;
        if (!email) continue;

        await sendEmail({
          to: email,
          subject: `Annual Renewal Reminder — ${company.company_name}`,
          html: `
            <p>Dear ${profile.fullname},</p>
            <p>This is a reminder that your annual maintenance fee for <strong>${company.company_name}</strong> is due soon.</p>
            <p><strong>Renewal Date:</strong> ${renewalDate.toDateString()}</p>
            <p><strong>Annual Fee:</strong> ₦${company.annual_fee.toLocaleString()}</p>
            <p>Please log in to your client portal to complete your renewal.</p>
            <p><a href="https://ctistech.com/client/renew-annual">Renew Now</a></p>
            <br/>
            <p>Thank you.</p>
          `,
        });
      }

      // 6️⃣ Log reminder
      await supabase.from("reminder_logs").insert({
        company_id: company.id,
        reminder_date: reminderDate,
        sent_at: new Date().toISOString(),
      });
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
