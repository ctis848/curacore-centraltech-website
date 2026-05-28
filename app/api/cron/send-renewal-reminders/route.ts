export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = supabaseServer();

    // 1️⃣ Load all companies with renewal dates
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name, annual_price, renewal_date");

    if (companiesError) {
      console.error("COMPANY LOAD ERROR:", companiesError);
      return NextResponse.json(
        { error: "Failed to load companies", details: companiesError.message },
        { status: 500 }
      );
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json({ message: "No companies found" });
    }

    const today = new Date();

    for (const company of companies) {
      if (!company.renewal_date) continue;

      const renewalDate = new Date(company.renewal_date);
      const diffDays = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / 86400000
      );

      // 2️⃣ Determine reminder type
      let reminderType: string | null = null;

      if (diffDays === 30) reminderType = "30days";
      else if (diffDays === 7) reminderType = "7days";
      else if (diffDays === 3) reminderType = "3days";
      else if (diffDays === 1) reminderType = "1day";
      else if (diffDays === 0) reminderType = "today";
      else if (diffDays < 0) reminderType = "overdue";

      if (!reminderType) continue;

      const reminderDateKey = `${renewalDate.toISOString().split("T")[0]}-${reminderType}`;

      // 3️⃣ Prevent duplicate reminders
      const { data: existingReminder } = await supabase
        .from("reminder_logs")
        .select("id")
        .eq("company_id", company.id)
        .eq("reminder_key", reminderDateKey)
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

      // 5️⃣ Send reminder email to each user
      for (const profile of profiles) {
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(profile.userid);

        if (authError) {
          console.error("AUTH USER ERROR:", authError);
          continue;
        }

        const email = authUser?.user?.email;
        if (!email) continue;

        // 🔥 Trigger Brevo email API
        await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/annual-reminder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: company.name,
              companyEmail: email,
              contactName: profile.fullname,
              dueDate: renewalDate.toISOString().split("T")[0],
              planName: "CentralCore EMR Annual Subscription",
              amountDue: company.annual_price,
              paymentLink: `${process.env.NEXT_PUBLIC_SITE_URL}/client/renew-annual`,
              type: reminderType,
            }),
          }
        );
      }

      // 6️⃣ Log reminder to prevent duplicates
      const { error: logError } = await supabase.from("reminder_logs").insert({
        company_id: company.id,
        reminder_key: reminderDateKey,
        sent_at: new Date().toISOString(),
      });

      if (logError) {
        console.error("REMINDER LOG ERROR:", logError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("CRON ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
