// FILE: /app/api/cron/send-renewal-reminders/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

const BREVO_API_KEY = process.env.BREVO_API_KEY as string;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL as string;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || NOTIFY_EMAIL) as string;

// -----------------------------------------------------
// SEND EMAIL (BREVO)
// -----------------------------------------------------
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
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

// -----------------------------------------------------
// RETRY SYSTEM
// -----------------------------------------------------
async function retry(fn: () => Promise<boolean>, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const ok = await fn();
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

// -----------------------------------------------------
// MAIN CRON HANDLER
// -----------------------------------------------------
export async function GET() {
  try {
    let companies: any[] = [];
    let supabaseFailed = false;

    // -----------------------------------------------------
    // LOAD COMPANIES
    // -----------------------------------------------------
    try {
      const { data, error } = await supabaseAdmin
        .from("companies")
        .select("id, name, renewal_date, annual_price, email")
        .not("renewal_date", "is", null);

      if (error || !data) supabaseFailed = true;
      else companies = data;
    } catch {
      supabaseFailed = true;
    }

    // -----------------------------------------------------
    // FALLBACK MODE
    // -----------------------------------------------------
    if (supabaseFailed) {
      companies = [
        {
          id: "fallback-1",
          name: "Test Hospital",
          renewal_date: new Date().toISOString(),
          annual_price: 500000,
          email: NOTIFY_EMAIL,
        },
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;

    // -----------------------------------------------------
    // PROCESS COMPANIES
    // -----------------------------------------------------
    for (const c of companies) {
      const renewalDate = new Date(c.renewal_date);
      const daysLeft = differenceInDays(renewalDate, today);

      if (!supabaseFailed) {
        if (daysLeft > 30 || daysLeft < 0) continue;
      }

      const email = c.email || NOTIFY_EMAIL;

      const subject = `Annual Subscription Renewal – Action Required | ${c.name}`;

      const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color:#4A4A4A;">Annual Subscription Renewal Reminder</h2>

          <p>Dear <strong>${c.name}</strong>,</p>

          <p>Your EMR Software annual subscription will expire in 
          <strong style="color:#d9534f;">${supabaseFailed ? "N/A (Test Mode)" : daysLeft + " days"}</strong>.</p>

          <p>To avoid interruption of your EMR access, patient records, and reporting tools, please proceed with your renewal.</p>

          <h3>Your Subscription Details</h3>
          <ul>
            <li><strong>Company:</strong> ${c.name}</li>
            <li><strong>Next Renewal Date:</strong> ${renewalDate.toLocaleDateString()}</li>
            <li><strong>Annual Fee:</strong> ₦${c.annual_price.toLocaleString()}</li>
          </ul>

          <h3>How to Renew</h3>
          <ol>
            <li>Visit <a href="https://www.ctistech.com">www.ctistech.com</a></li>
            <li>Log in to your Client Portal</li>
            <li>Email: <strong>${c.email || "Your registered email"}</strong></li>
            <li>Password: <strong>******</strong></li>
            <li>Click <strong>Renew Annual Payment</strong></li>
          </ol>

          <p>If you have already renewed, kindly disregard this message.</p>

          <p>Warm regards,<br/>
          <strong>CTIS Support Team</strong><br/>
          <a href="https://www.ctistech.com">www.ctistech.com</a></p>
        </div>
      `;

      const ok = await retry(() => sendBrevoEmail(email, subject, html));

      if (!ok) {
        await sendBrevoEmail(
          ADMIN_EMAIL,
          "CRON FAILURE ALERT",
          `<p>Failed to send reminder for ${c.name}</p>`
        );
      }

      if (ok) sent++;
    }

    // -----------------------------------------------------
    // SUMMARY EMAIL
    // -----------------------------------------------------
    await sendBrevoEmail(
      ADMIN_EMAIL,
      `Daily Renewal Summary – ${sent} sent`,
      `<p>${sent} reminders sent.</p>`
    );

    // -----------------------------------------------------
    // LOG TO cron_logs
    // -----------------------------------------------------
    await supabaseAdmin.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: supabaseFailed ? "warning" : "success",
      message: `Cron executed. ${sent} reminders sent.`,
      error: null,
      companies_notified: sent,
      supabase_status: supabaseFailed ? "fallback" : "ok",
      metadata: {
        fallback_mode: supabaseFailed,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      count: sent,
      supabase: supabaseFailed ? "fallback" : "ok",
    });
  } catch (err: any) {
    await supabaseAdmin.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "failed",
      message: "Cron crashed",
      error: String(err),
      companies_notified: 0,
      supabase_status: "failed",
      metadata: { timestamp: new Date().toISOString() },
    });

    return NextResponse.json(
      { success: false, error: "Cron crashed" },
      { status: 500 }
    );
  }
}
