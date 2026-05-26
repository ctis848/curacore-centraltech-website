export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ReminderType =
  | "ONE_MONTH"
  | "FOURTEEN_DAYS"
  | "SEVEN_DAYS"
  | "THREE_DAYS"
  | "DUE_TODAY"
  | "OVERDUE";

function getReminderType(renewalDateStr: string): ReminderType | null {
  const today = new Date();
  const renewal = new Date(renewalDateStr);

  today.setHours(0, 0, 0, 0);
  renewal.setHours(0, 0, 0, 0);

  const diffMs = renewal.getTime() - today.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days === 30) return "ONE_MONTH";
  if (days === 14) return "FOURTEEN_DAYS";
  if (days === 7) return "SEVEN_DAYS";
  if (days === 3) return "THREE_DAYS";
  if (days === 0) return "DUE_TODAY";
  if (days < 0) return "OVERDUE";

  return null;
}

async function sendBrevoEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    console.error("Missing Brevo env vars");
    return;
  }

  const payload = {
    sender: {
      name: "CentralCore Renewals",
      email: notifyEmail,
    },
    to: [{ email: params.toEmail, name: params.toName }],
    subject: params.subject,
    htmlContent: params.html,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Brevo renewal email error:", txt);
  }
}

function buildEmailContent(opts: {
  type: ReminderType;
  companyName: string;
  renewalDate: string;
  amount: number;
  paymentLink: string;
}) {
  const niceDate = new Date(opts.renewalDate).toLocaleDateString();
  const amountStr = `₦${opts.amount.toLocaleString()}`;

  let title = "";
  let intro = "";

  switch (opts.type) {
    case "ONE_MONTH":
      title = "Annual Renewal – 1 Month Notice";
      intro = "Your CentralCore annual subscription is due in 1 month.";
      break;
    case "FOURTEEN_DAYS":
      title = "Annual Renewal – 14 Days Remaining";
      intro = "Your CentralCore annual subscription is due in 14 days.";
      break;
    case "SEVEN_DAYS":
      title = "Annual Renewal – 7 Days Remaining";
      intro = "Your CentralCore annual subscription is due in 7 days.";
      break;
    case "THREE_DAYS":
      title = "Annual Renewal – 3 Days Remaining";
      intro = "Your CentralCore annual subscription is due in 3 days.";
      break;
    case "DUE_TODAY":
      title = "Annual Renewal – Due Today";
      intro = "Your CentralCore annual subscription is due today.";
      break;
    case "OVERDUE":
      title = "Annual Renewal – Overdue";
      intro = "Your CentralCore annual subscription is now overdue.";
      break;
  }

  const html = `
    <h2>${title}</h2>
    <p>Dear <strong>${opts.companyName}</strong>,</p>
    <p>${intro}</p>
    <p><strong>Renewal Date:</strong> ${niceDate}</p>
    <p><strong>Amount:</strong> ${amountStr}</p>

    <p>You can complete your renewal securely using the link below:</p>

    <p>
      <a href="${opts.paymentLink}"
         style="display:inline-block;padding:12px 20px;background:#16a34a;color:#ffffff;
                text-decoration:none;border-radius:6px;font-weight:bold;">
        Pay Now & Renew
      </a>
    </p>

    <p>If you prefer bank transfer, please use your dedicated CentralCore payment account.</p>

    <p>Thank you,<br/>CentralCore Billing Team</p>
  `;

  return { subject: title, html };
}

export async function GET() {
  try {
    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, annual_price, renewal_date")
      .not("renewal_date", "is", null);

    if (error) {
      console.error("Cron companies error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    let sentCount = 0;

    for (const c of companies) {
      const type = getReminderType(c.renewal_date);
      if (!type) continue;

      const { data: client, error: clientError } = await supabaseAdmin
        .from("Client")
        .select("email, companyname")
        .eq("companyname", c.name)
        .single();

      if (clientError || !client?.email) {
        console.warn("No Client email for:", c.name);
        continue;
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
      const paymentLink = `${baseUrl}/client/renew-annual?company_id=${c.id}`;

      const { subject, html } = buildEmailContent({
        type,
        companyName: client.companyname,
        renewalDate: c.renewal_date,
        amount: Number(c.annual_price || 0),
        paymentLink,
      });

      await sendBrevoEmail({
        toEmail: client.email,
        toName: client.companyname,
        subject,
        html,
      });

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      processed: companies.length,
      emailsSent: sentCount,
    });
  } catch (err: any) {
    console.error("Renewals cron error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
