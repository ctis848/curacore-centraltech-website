import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7 = new Date();
    in7.setDate(today.getDate() + 7);
    in7.setHours(0, 0, 0, 0);

    const todayISO = today.toISOString().split("T")[0];
    const in7ISO = in7.toISOString().split("T")[0];

    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, renewal_date, annual_price")
      .not("renewal_date", "is", null)
      .gte("renewal_date", todayISO)
      .lte("renewal_date", in7ISO);

    if (error || !data) {
      // log no-companies run
      await supabaseAdmin.from("cron_logs").insert({
        status: "success",
        companies_notified: 0,
        message: "No companies found for renewal window",
      });

      // email report
      await sendBrevoEmail(
        NOTIFY_EMAIL!,
        "Daily Renewal Cron Report",
        `
          <h3>Cron Job Report</h3>
          <p>Status: <strong>Success</strong></p>
          <p>Companies Notified: <strong>0</strong></p>
          <p>Note: No companies found between ${todayISO} and ${in7ISO}.</p>
          <p>Time: ${new Date().toLocaleString("en-NG", {
            timeZone: "Africa/Lagos",
          })}</p>
        `
      );

      return NextResponse.json({
        success: true,
        count: 0,
        message: "No companies found",
      });
    }

    let sent = 0;

    for (const c of data) {
      const html = `
        <h2>Annual Subscription Renewal – Action Required</h2>

        <p>Dear <strong>${c.name}</strong>,</p>

        <p>This is a reminder that your <strong>EMR Software annual subscription</strong> will expire in <strong>7 days</strong>.</p>

        <p>To avoid any interruption in your access to the EMR platform, patient records, reporting tools, and all clinical features, kindly proceed with your renewal.</p>

        <h3>How to Renew Your Subscription</h3>
        <ol>
          <li>Visit our website: <a href="https://www.ctistech.com">www.ctistech.com</a></li>
          <li>Log in to your Client Portal</li>
          <li>Email: <strong>your registered email</strong></li>
          <li>Password: <strong>your portal password</strong></li>
          <li>Scroll down to <strong>Renew Annual Payment</strong></li>
          <li>Choose your preferred payment method (Card or Bank Transfer)</li>
        </ol>

        <p><strong>Annual Payment:</strong> ₦${c.annual_price.toLocaleString()}</p>

        <p>If you have already renewed your subscription, please disregard this notice.</p>

        <p>Thank you for your continued trust in EMR. We remain committed to delivering reliable, innovative, and professional IT solutions.</p>

        <p>Warm regards,<br>
        Central Tech Information System (CTIS) Support Team<br>
        <a href="https://www.ctistech.com">www.ctistech.com</a></p>
      `;

      const ok = await sendBrevoEmail(
        NOTIFY_EMAIL!,
        `Annual Subscription Renewal – ${c.name}`,
        html
      );

      if (ok) sent++;
    }

    // log successful run
    await supabaseAdmin.from("cron_logs").insert({
      status: "success",
      companies_notified: sent,
      message: "Auto reminders sent",
    });

    // email summary report
    await sendBrevoEmail(
      NOTIFY_EMAIL!,
      "Daily Renewal Cron Report",
      `
        <h3>Cron Job Report</h3>
        <p>Status: <strong>Success</strong></p>
        <p>Companies Notified: <strong>${sent}</strong></p>
        <p>Window: ${todayISO} to ${in7ISO}</p>
        <p>Time: ${new Date().toLocaleString("en-NG", {
          timeZone: "Africa/Lagos",
        })}</p>
      `
    );

    return NextResponse.json({
      success: true,
      count: sent,
      message: "Auto reminders sent",
    });
  } catch (err) {
    console.error("Cron error:", err);

    // log failure
    await supabaseAdmin.from("cron_logs").insert({
      status: "failed",
      companies_notified: 0,
      message: "Cron failed",
      error: String(err),
    });

    // email failure report
    await sendBrevoEmail(
      NOTIFY_EMAIL!,
      "Daily Renewal Cron FAILED",
      `
        <h3>Cron Job Failed</h3>
        <p>Time: ${new Date().toLocaleString("en-NG", {
          timeZone: "Africa/Lagos",
        })}</p>
        <p>Error: ${String(err)}</p>
      `
    );

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
