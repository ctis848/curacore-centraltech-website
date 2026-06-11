import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

async function sendBrevoEmail(toEmail: string, subject: string, html: string) {
  const payload = {
    sender: { name: "CentralCore Renewals", email: NOTIFY_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent: html,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, renewal_date, annual_price, email")
      .not("renewal_date", "is", null);

    if (error || !data) {
      return NextResponse.json({ success: false, message: "DB error" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;

    for (const c of data) {
      const renewalDate = new Date(c.renewal_date);
      const daysLeft = differenceInDays(renewalDate, today);

      let subject = "";
      let html = "";

      // EXPIRED
      if (daysLeft < 0) {
        subject = `Your EMR Subscription Has Expired – ${c.name}`;
        html = `
          <h2>Subscription Expired</h2>
          <p>Dear <strong>${c.name}</strong>,</p>
          <p>Your EMR subscription expired on <strong>${c.renewal_date}</strong>.</p>
          <p>Please renew immediately to restore full access.</p>
        `;
      }

      // DUE IN 3 DAYS
      else if (daysLeft <= 3) {
        subject = `Your EMR Subscription Expires in ${daysLeft} Days – ${c.name}`;
        html = `
          <h2>Renewal Reminder</h2>
          <p>Dear <strong>${c.name}</strong>,</p>
          <p>Your EMR subscription expires in <strong>${daysLeft} days</strong>.</p>
          <p>Please renew to avoid service interruption.</p>
        `;
      }

      // DUE IN 7 DAYS
      else if (daysLeft <= 7) {
        subject = `Your EMR Subscription Expires in ${daysLeft} Days – ${c.name}`;
        html = `
          <h2>Upcoming Renewal</h2>
          <p>Dear <strong>${c.name}</strong>,</p>
          <p>Your EMR subscription expires in <strong>${daysLeft} days</strong>.</p>
          <p>Please renew soon.</p>
        `;
      }

      // DUE IN 30 DAYS
      else if (daysLeft <= 30) {
        subject = `Your EMR Subscription Expires in ${daysLeft} Days – ${c.name}`;
        html = `
          <h2>Advance Renewal Notice</h2>
          <p>Dear <strong>${c.name}</strong>,</p>
          <p>Your EMR subscription expires in <strong>${daysLeft} days</strong>.</p>
          <p>This is an early reminder to plan your renewal.</p>
        `;
      }

      // NOT DUE — skip
      else {
        continue;
      }

      const ok = await sendBrevoEmail(
        c.email || NOTIFY_EMAIL!,
        subject,
        html
      );

      if (ok) sent++;
    }

    // Log success
    await supabaseAdmin.from("cron_logs").insert({
      status: "success",
      companies_notified: sent,
      message: "Full renewal reminders sent",
    });

    return NextResponse.json({
      success: true,
      count: sent,
      message: "Full renewal reminders sent",
    });
  } catch (err) {
    console.error("Cron error:", err);

    await supabaseAdmin.from("cron_logs").insert({
      status: "failed",
      companies_notified: 0,
      message: "Cron failed",
      error: String(err),
    });

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
