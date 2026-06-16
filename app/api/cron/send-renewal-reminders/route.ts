import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL; // e.g. info@ctistech.com
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || NOTIFY_EMAIL;

// -----------------------------------------------------
// HARD FAIL IF ENV IS MISCONFIGURED
// -----------------------------------------------------
function ensureEnv() {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY is not set");
  if (!NOTIFY_EMAIL) throw new Error("NOTIFY_EMAIL is not set");
  if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL is not set");
}

// -----------------------------------------------------
// SEND EMAIL (BREVO)
// -----------------------------------------------------
async function sendBrevoEmail(
  toEmail: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const payload = {
    sender: { name: "CentralCore Renewals", email: NOTIFY_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent: html,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

// -----------------------------------------------------
// RETRY SYSTEM (3 attempts)
// -----------------------------------------------------
async function retry(
  fn: () => Promise<{ ok: boolean; status: number; body: string }>,
  attempts = 3
) {
  let last: { ok: boolean; status: number; body: string } | null = null;

  for (let i = 0; i < attempts; i++) {
    const res = await fn();
    last = res;
    if (res.ok) return res;
    await new Promise((r) => setTimeout(r, 1000));
  }

  return last ?? { ok: false, status: 0, body: "No response" };
}

// -----------------------------------------------------
// MAIN CRON HANDLER
// -----------------------------------------------------
export async function GET() {
  try {
    ensureEnv();

    // Load companies with renewal dates
    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select(
        "id, name, renewal_date, annual_price, contact_email, portal_password"
      )
      .not("renewal_date", "is", null);

    if (error || !companies) {
      console.error("DB error:", error);
      return NextResponse.json({ success: false, message: "DB error" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;
    const notifiedCompanies: {
      id: string;
      name: string;
      email: string;
      daysLeft: number;
      renewalDate: string;
      annualPrice: number;
    }[] = [];

    for (const c of companies) {
      if (!c.renewal_date) continue;

      const renewalDate = new Date(c.renewal_date);
      if (isNaN(renewalDate.getTime())) {
        console.warn("Invalid renewal_date for company:", c.id, c.name, c.renewal_date);
        continue;
      }

      const daysLeft = differenceInDays(renewalDate, today);

      // DAILY REMINDER FROM 30 DAYS → 0 DAY (inclusive)
      if (daysLeft > 30 || daysLeft < 0) continue;

      const email = c.contact_email || NOTIFY_EMAIL;
      if (!email) {
        console.warn("No email for company:", c.id, c.name);
        continue;
      }

      const subject = `Annual Subscription Renewal – Action Required | ${c.name}`;

      const html = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color:#4A4A4A;">Annual Subscription Renewal Reminder</h2>

          <p>Dear <strong>${c.name}</strong>,</p>

          <p>Your EMR Software annual subscription will expire in 
          <strong style="color:#d9534f;">${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>.</p>

          <p>To avoid interruption of your EMR access, patient records, and reporting tools, please proceed with your renewal.</p>

          <h3>Your Subscription Details</h3>
          <ul>
            <li><strong>Company:</strong> ${c.name}</li>
            <li><strong>Next Renewal Date:</strong> ${renewalDate.toLocaleDateString()}</li>
            <li><strong>Annual Fee:</strong> ₦${Number(c.annual_price || 0).toLocaleString()}</li>
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

      const result = await retry(() => sendBrevoEmail(email, subject, html));

      if (!result.ok) {
        console.error("Failed to send renewal email:", {
          companyId: c.id,
          companyName: c.name,
          email,
          status: result.status,
          body: result.body,
        });

        // ADMIN ALERT EMAIL
        await retry(() =>
          sendBrevoEmail(
            ADMIN_EMAIL as string,
            "CRON FAILURE ALERT – Renewal Reminder Not Sent",
            `
              <p><strong>CRON FAILED</strong></p>
              <p>Company: ${c.name}</p>
              <p>Email: ${email}</p>
              <p>Days Left: ${daysLeft}</p>
              <p>Error Status: ${result.status}</p>
              <pre>${result.body}</pre>
            `
          )
        );

        continue;
      }

      sent++;
      notifiedCompanies.push({
        id: c.id,
        name: c.name,
        email,
        daysLeft,
        renewalDate: renewalDate.toISOString(),
        annualPrice: Number(c.annual_price || 0),
      });
    }

    // -----------------------------------------------------
    // SEND SUMMARY EMAIL TO ADMIN / INFO@CTISTECH.COM
    // -----------------------------------------------------
    if (sent > 0) {
      const summaryRows = notifiedCompanies
        .map(
          (c) => `
          <tr>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.daysLeft}</td>
            <td>${new Date(c.renewalDate).toLocaleDateString()}</td>
            <td>₦${c.annualPrice.toLocaleString()}</td>
          </tr>
        `
        )
        .join("");

      const summaryHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>Daily Renewal Reminder Summary</h2>
          <p>The cron job has successfully sent renewal reminder emails to <strong>${sent}</strong> client(s).</p>
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th align="left">Company</th>
                <th align="left">Email</th>
                <th align="left">Days Left</th>
                <th align="left">Renewal Date</th>
                <th align="left">Annual Fee</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRows}
            </tbody>
          </table>
          <p>Sent to: <strong>${ADMIN_EMAIL}</strong></p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `;

      await retry(() =>
        sendBrevoEmail(
          ADMIN_EMAIL as string,
          `Daily Renewal Reminder Summary – ${sent} client(s) notified`,
          summaryHtml
        )
      );
    } else {
      // Optional: notify admin that no clients were due
      await retry(() =>
        sendBrevoEmail(
          ADMIN_EMAIL as string,
          "Daily Renewal Reminder Summary – No clients due",
          `
            <p>No clients were within the 0–30 day renewal window today.</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          `
        )
      );
    }

    // -----------------------------------------------------
    // LOG SUCCESS
    // -----------------------------------------------------
    await supabaseAdmin.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "success",
      companies_notified: sent,
      message: "Daily renewal reminders processed",
    });

    return NextResponse.json({
      success: true,
      count: sent,
      message: "Daily renewal reminders processed",
    });
  } catch (err) {
    console.error("Cron error:", err);

    // LOG FAILURE
    await supabaseAdmin.from("cron_logs").insert({
      job_name: "renewal_reminder",
      status: "failed",
      companies_notified: 0,
      message: "Cron failed",
      error: String(err),
    });

    // Try to notify admin even on hard failure
    if (ADMIN_EMAIL && BREVO_API_KEY && NOTIFY_EMAIL) {
      await sendBrevoEmail(
        ADMIN_EMAIL,
        "CRON FATAL ERROR – Renewal Reminder Job",
        `
          <p><strong>CRON FATAL ERROR</strong></p>
          <pre>${String(err)}</pre>
          <p>Time: ${new Date().toLocaleString()}</p>
        `
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
