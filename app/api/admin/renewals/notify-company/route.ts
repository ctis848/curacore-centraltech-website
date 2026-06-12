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

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing company ID" },
        { status: 400 }
      );
    }

    const { data: company, error } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const renewalDate = new Date(company.renewal_date);
    const daysLeft = differenceInDays(renewalDate, today);

    let subject = "";
    let html = "";

    if (daysLeft < 0) {
      subject = `Your EMR Subscription Has Expired – ${company.name}`;
      html = `
        <h2>Subscription Expired</h2>
        <p>Dear <strong>${company.name}</strong>,</p>
        <p>Your EMR subscription expired on <strong>${company.renewal_date}</strong>.</p>
        <p>Please renew immediately to restore full access.</p>
      `;
    } else if (daysLeft <= 3) {
      subject = `Your EMR Subscription Expires in ${daysLeft} Days – ${company.name}`;
      html = `
        <h2>Renewal Reminder</h2>
        <p>Dear <strong>${company.name}</strong>,</p>
        <p>Your EMR subscription expires in <strong>${daysLeft} days</strong>.</p>
        <p>Please renew to avoid service interruption.</p>
      `;
    } else if (daysLeft <= 7) {
      subject = `Your EMR Subscription Expires in ${daysLeft} Days – ${company.name}`;
      html = `
        <h2>Upcoming Renewal</h2>
        <p>Dear <strong>${company.name}</strong>,</p>
        <p>Your EMR subscription expires in <strong>${daysLeft} days</strong>.</p>
        <p>Please renew soon.</p>
      `;
    } else if (daysLeft <= 30) {
      subject = `Your EMR Subscription Expires in ${daysLeft} Days – ${company.name}`;
      html = `
        <h2>Advance Renewal Notice</h2>
        <p>Dear <strong>${company.name}</strong>,</p>
        <p>Your EMR subscription expires in <strong>${daysLeft} days</strong>.</p>
        <p>This is an early reminder to plan your renewal.</p>
      `;
    } else {
      return NextResponse.json({
        success: false,
        message: "Company is not within renewal window",
      });
    }

    const ok = await sendBrevoEmail(
      company.email || NOTIFY_EMAIL!,
      subject,
      html
    );

    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder sent successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
