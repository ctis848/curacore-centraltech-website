export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = supabaseServer();

    // 1️⃣ Load all companies with renewal dates
    const { data: companies, error } = await supabase
      .from("companies")
      .select("id, name, annual_price, renewal_date");

    if (error) {
      console.error("SUPABASE COMPANIES ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load companies", details: error.message },
        { status: 500 }
      );
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json(
        { error: "No companies found" },
        { status: 404 }
      );
    }

    const today = new Date();

    for (const company of companies) {
      if (!company.renewal_date) continue;

      const renewalDate = new Date(company.renewal_date);
      const diffDays = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / 86400000
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
      const { data: profiles, error: profileError } = await supabase
        .from("Profile")
        .select("userid, fullname")
        .eq("company_id", company.id);

      if (profileError) {
        console.error("PROFILE LOAD ERROR:", profileError);
        continue;
      }

      if (!profiles) continue;

      // 5️⃣ Send Brevo email to each user
      for (const profile of profiles) {
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(profile.userid);

        if (authError) {
          console.error("AUTH USER ERROR:", authError);
          continue;
        }

        const email = authUser?.user?.email;
        if (!email) continue;

        // 🔥 Use your Brevo notification API
        await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/annual-reminder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: company.name, // UPDATED
              companyEmail: email,
              contactName: profile.fullname,
              dueDate: renewalDate.toISOString().split("T")[0],
              planName: "Annual Maintenance Fee",
              amountDue: company.annual_price, // UPDATED
              paymentLink: `${process.env.NEXT_PUBLIC_SITE_URL}/client/renew-annual`,
              type:
                diffDays === 30
                  ? "30days"
                  : diffDays === 7
                  ? "7days"
                  : "7days",
            }),
          }
        );
      }

      // 6️⃣ Log reminder
      const { error: logError } = await supabase.from("reminder_logs").insert({
        company_id: company.id,
        reminder_date: reminderDate,
        sent_at: new Date().toISOString(),
      });

      if (logError) {
        console.error("REMINDER LOG INSERT ERROR:", logError);
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
