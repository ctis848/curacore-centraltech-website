import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || NOTIFY_EMAIL;

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
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

// -----------------------------------------------------
// RETRY SYSTEM (3 attempts)
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
    // Load companies with renewal dates
    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select(
        "id, name, renewal_date, annual_price, contact_email, portal_password"
      )
      .not("renewal_date", "is", null);

    if (error || !companies) {
      return NextResponse.json({ success: false, message: "DB error" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;

    for (const c of companies) {
      const renewalDate = new Date(c.renewal_date);
      const daysLeft = differenceInDays(renewalDate, today);

      // -----------------------------------------------------
      // DAILY REMINDER FROM 30 DAYS → 1 DAY
      // -----------------------------------------------------
      if (daysLeft > 30 || daysLeft < 1) continue;

      const email = c.contact_email || NOTIFY_EMAIL;
      if (!email) continue;

      // -----------------------------------------------------
      // EMAIL TEMPLATE
      // -----------------------------------------------------
      const subject = `Annual Subscription Renewal – Action Required | ${c.name}`;

      const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color:#4A4A4A;">Annual Subscription Renewal Reminder</h2>

          <p>Dear <strong>${c.name}</strong>,</p>

          <p>Your EMR Software annual subscription will expire in 
          <strong style="color:#d9534f;">${daysLeft} days</strong>.</p>

          <p>To avoid interruption of your EMR access, patient records, and reporting tools, please proceed with your renewal.</p>

          <h3>Your Subscription Details</h3>
          <ul>
            <li><strong>Company:</strong> ${c.name}</li>
            <li><strong>Next Renewal Date:</strong> ${new Date(
              c.renewal_date
            ).toLocaleDateString()}</li>
            <li><strong>Annual Fee:</strong> ₦${c.annual_price.toLocaleString()}</li>
          </ul>

          <h3>How to Renew</h3>
          <ol>
            <li>Visit <a href="https://www.ctistech.com">www.ctistech.com</a></li>
            <li>Log in to your Client Portal</li>
            <li>Email: <strong>${email}</strong></li>
            <li>Password: <strong>${c.portal_password || "******"}</strong></li>
            <li>Click <strong>Renew Annual Payment</strong></li>
          </ol>

          <p>If you have already renewed, kindly disregard this message.</p>

          <p>Warm regards,<br/>
          <strong>CTIS Support Team</strong><br/>
          <a href="https://www.ctistech.com">www.ctistech.com</a></p>
        </div>
      `;

      // -----------------------------------------------------
      // SEND EMAIL WITH RETRY SYSTEM
      // -----------------------------------------------------
      const ok = await retry(() => sendBrevoEmail(email, subject, html));

      if (!ok) {
        // ADMIN ALERT EMAIL
        await sendBrevoEmail(
          ADMIN_EMAIL!,
          "CRON FAILURE ALERT – Renewal Reminder Not Sent",
          `
            <p><strong>CRON FAILED</strong></p>
            <p>Company: ${c.name}</p>
            <p>Email: ${email}</p>
            <p>Error: Failed to send renewal reminder after 3 attempts.</p>
          `
        );
      }

      if (ok) sent++;
    }

    // -----------------------------------------------------
    // LOG SUCCESS
    // -----------------------------------------------------
    await supabaseAdmin.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "success",
      companies_notified: sent,
      message: "Daily renewal reminders sent",
    });

    return NextResponse.json({
      success: true,
      count: sent,
      message: "Daily renewal reminders sent",
    });
  } catch (err) {
    console.error("Cron error:", err);

    // -----------------------------------------------------
    // LOG FAILURE
    // -----------------------------------------------------
    await supabaseAdmin.from("cron_logs").insert({
      job_name: "renewal_reminder",
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
