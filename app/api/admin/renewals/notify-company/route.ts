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

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, renewal_date, annual_amount, email, portal_password")
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

      if (daysLeft > 30) continue;

      const subject = `Annual Subscription Renewal – Action Required | ${c.name}`;

      const html = `
      <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <!-- HEADER -->
          <div style="background:#1e3a8a; padding:20px; text-align:center;">
            <img src="https://ctistech.com/logo.png" alt="CTIS Logo" style="width:120px; margin-bottom:10px;" />
            <h2 style="color:white; margin:0;">Central Tech Information System</h2>
          </div>

          <!-- BODY -->
          <div style="padding:25px; color:#333; line-height:1.6;">

            <p>Dear Valued Client, <strong>${c.name}</strong></p>

            <p>This is an official reminder that your EMR Software annual subscription will expire in 
            <strong>${daysLeft}</strong> days.</p>

            <p>To avoid any interruption in your access to the EMR platform, patient records, reporting tools, and all associated clinical features, kindly proceed with your renewal.</p>

            <p>Your continued access to the EMR system depends on completing this renewal before the due date.</p>

            <h3 style="color:#1e3a8a;">How to Renew Your Subscription:</h3>
            <ol>
              <li>Visit our website: <a href="https://www.ctistech.com">www.ctistech.com</a></li>
              <li>Log in to your Client Portal using your credentials</li>
              <li>Welcome Back</li>
              <li>Email: <strong>${c.email}</strong></li>
              <li>Password: <strong>${c.portal_password || "******"}</strong></li>
              <li>Scroll down to <strong>Renew Annual Payment</strong></li>
              <li>Choose your preferred payment method (Card or Bank Transfer)</li>
            </ol>

            <p><strong>Annual Payment:</strong> ₦${c.annual_amount || "0.00"}</p>

            <!-- RENEW BUTTON -->
            <div style="text-align:center; margin:30px 0;">
              <a href="https://www.ctistech.com/client-portal/login"
                style="background:#1e3a8a; color:white; padding:14px 28px; border-radius:6px; text-decoration:none; font-size:16px; font-weight:bold;">
                Renew Now
              </a>
            </div>

            <p>If you have already renewed your subscription, please disregard this notice.</p>

            <p>Thank you for your continued trust in EMR. We remain committed to delivering reliable, innovative, and professional IT solutions to support your operations.</p>
          </div>

          <!-- FOOTER -->
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

      if (ok) sent++;
    }

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
