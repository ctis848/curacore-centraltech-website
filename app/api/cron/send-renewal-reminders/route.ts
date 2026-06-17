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

      const headerImage = "https://via.placeholder.com/600x150/1a237e/ffffff?text=CTIS+Technologies";
      // Replace with your real CTIS banner URL

      const html = `
        <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- HEADER IMAGE -->
            <div style="width:100%; text-align:center; background:#1a237e;">
              <img src="${headerImage}" alt="CTIS Technologies" style="width:100%; max-width:600px; display:block;" />
            </div>

            <!-- HEADER TITLE -->
            <div style="background:#1a237e; padding:20px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:22px; font-weight:700;">
                CTIS Annual Subscription Renewal
              </h1>
            </div>

            <!-- BODY -->
            <div style="padding:30px; color:#333; line-height:1.7;">

              <p style="font-size:16px;">Dear <strong>${c.name}</strong>,</p>

              <p style="font-size:15px;">
                This is a reminder that your EMR Software annual subscription will expire in 
                <strong style="color:#d9534f;">${supabaseFailed ? "N/A (Test Mode)" : daysLeft + " days"}</strong>.
              </p>

              <p style="font-size:15px;">
                To avoid interruption of your EMR access, patient records, and reporting tools, please proceed with your renewal.
              </p>

              <h3 style="margin-top:25px; color:#1a237e;">Your Subscription Details</h3>
              <table style="width:100%; font-size:15px; margin-top:10px;">
                <tr>
                  <td style="padding:6px 0;"><strong>Company:</strong></td>
                  <td>${c.name}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>Next Renewal Date:</strong></td>
                  <td>${renewalDate.toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>Annual Fee:</strong></td>
                  <td>₦${c.annual_price.toLocaleString()}</td>
                </tr>
              </table>

              <h3 style="margin-top:25px; color:#1a237e;">How to Renew</h3>
              <ol style="font-size:15px; padding-left:18px; margin-top:10px;">
                <li>Visit <a href="https://www.ctistech.com" style="color:#1a237e;">www.ctistech.com</a></li>
                <li>Log in to your Client Portal</li>
                <li>Email: <strong>${c.email}</strong></li>
                <li>Password: <strong>******</strong></li>
                <li>Click <strong>Renew Annual Payment</strong></li>
              </ol>

              <!-- BUTTON -->
              <div style="text-align:center; margin:30px 0;">
                <a href="https://www.ctistech.com"
                  style="
                    background:#1a237e;
                    color:#ffffff;
                    padding:12px 25px;
                    border-radius:6px;
                    text-decoration:none;
                    font-size:16px;
                    font-weight:600;
                    display:inline-block;
                  ">
                  Renew Now
                </a>
              </div>

              <p style="font-size:14px; color:#555;">
                If you have already renewed, kindly disregard this message.
              </p>

              <p style="font-size:14px; margin-top:25px;">
                Warm regards,<br/>
                <strong>CTIS Support Team</strong><br/>
                <a href="https://www.ctistech.com" style="color:#1a237e;">www.ctistech.com</a>
              </p>
            </div>

            <!-- FOOTER -->
            <div style="background:#eceff1; padding:15px; text-align:center; font-size:12px; color:#555;">
              © ${new Date().getFullYear()} CTIS Technologies. All rights reserved.
            </div>

          </div>
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
