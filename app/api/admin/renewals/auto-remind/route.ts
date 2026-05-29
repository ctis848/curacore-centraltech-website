import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

async function sendBrevoEmail(toEmail: string, subject: string, html: string) {
  if (!BREVO_API_KEY || !NOTIFY_EMAIL) {
    console.error("Missing Brevo env vars");
    return false;
  }

  const payload = {
    sender: {
      name: "CentralCore Renewals",
      email: NOTIFY_EMAIL,
    },
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

  if (!res.ok) {
    console.error("Brevo error:", await res.text());
    return false;
  }

  return true;
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
      console.error("Auto-remind fetch error:", error);
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No companies found or query failed",
      });
    }

    let sent = 0;

    for (const c of data) {
      // You can extend this to fetch company contact email from another table
      const toEmail = NOTIFY_EMAIL as string;

      const html = `
        <h2>Upcoming Renewal Reminder</h2>
        <p>Company: <strong>${c.name}</strong></p>
        <p>Renewal Date: <strong>${c.renewal_date}</strong></p>
        <p>Annual Fee: <strong>₦${(c.annual_price || 0).toLocaleString()}</strong></p>
        <p>This is an automated reminder from CentralCore.</p>
      `;

      const ok = await sendBrevoEmail(
        toEmail,
        `Renewal Reminder: ${c.name}`,
        html
      );

      if (ok) sent++;
    }

    return NextResponse.json({
      success: true,
      count: sent,
      message: "Auto reminders sent via Brevo",
    });
  } catch (err: any) {
    console.error("Auto-remind error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
