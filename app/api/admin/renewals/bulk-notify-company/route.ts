import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

// -----------------------------------------------------
// SEND EMAIL (BREVO)
// -----------------------------------------------------
async function sendBrevoEmail(toEmail: string, subject: string, html: string) {
  const payload = {
    sender: { name: "CentralCore Renewals", email: NOTIFY_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent: html,
    trackOpens: true,
    trackClicks: true,
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
// BULK NOTIFY HANDLER
// -----------------------------------------------------
export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No company IDs provided",
      });
    }

    // Load selected companies
    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, renewal_date, annual_amount, email, portal_password")
      .in("id", ids);

    if (error || !companies) {
      return NextResponse.json({
        success: false,
        message: "Failed to load companies",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;

    for (const c of companies) {
      const renewalDate = new Date(c.renewal_date);
      const daysLeft = differenceInDays(renewalDate, today);

      // Only notify within 30 → 1 days
      if (daysLeft > 30 || daysLeft < 1) continue;

      const subject = `Annual Subscription Renewal – Action Required | ${c.name}`;

      const html = `
      <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <div style="background:#1e3a8a; padding:20px; text-align:center;">
            <img src="https://ctistech.com/logo.png" alt="CTIS Logo" style="width:120px; margin-bottom:10px;" />
            <h2 style="color:white; margin:0;">Central Tech Information System</h2>
          </div>

          <div style="padding:25px; color:#333; line-height:1.6;">
            <p>Dear <strong>${c.name}</strong>,</p>

            <p>Your EMR Software annual subscription will expire in 
            <strong>${daysLeft}</strong> days.</p>

            <p>To avoid any interruption in your access to the EMR platform, patient records, reporting tools, and all associated clinical features, kindly proceed with your renewal.</p>

            <h3 style="color:#1e3a8a;">How to Renew Your Subscription:</h3>
            <ol>
              <li>Visit: <a href="https://www.ctistech.com">www.ctistech.com</a></li>
              <li>Log in to your Client Portal</li>
              <li>Email: <strong>${c.email}</strong></li>
              <li>Password: <strong>${c.portal_password || "******"}</strong></li>
              <li>Click <strong>Renew Annual Payment</strong></li>
            </ol>

            <p><strong>Annual Payment:</strong> ₦${Number(c.annual_amount).toLocaleString()}</p>

            <div style="text-align:center; margin:30px 0;">
              <a href="https://www.ctistech.com/client-portal/login"
                style="background:#1e3a8a; color:white; padding:14px 28px; border-radius:6px; text-decoration:none; font-size:16px; font-weight:bold;">
                Renew Now
              </a>
            </div>

            <p>If you have already renewed your subscription, please disregard this notice.</p>
          </div>

          <div style="background:#f0f0f0; padding:15px; text-align:center; font-size:13px; color:#555;">
            <p>Central Tech Information System (CTIS)</p>
            <p><a href="https://www.ctistech.com">www.ctistech.com</a></p>
            <p>This email includes open & click tracking for service quality.</p>
          </div>

        </div>
      </div>
      `;

      const ok = await sendBrevoEmail(
        c.email || NOTIFY_EMAIL!,
        subject,
        html
      );

      if (ok) {
        sent++;

        // Log reminder history
        await supabaseAdmin.from("renewal_reminder_history").insert({
          company_id: c.id,
          days_left: daysLeft,
          sent_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk reminders sent (${sent})`,
      count: sent,
    });
  } catch (err) {
    console.error("Bulk notify error:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
