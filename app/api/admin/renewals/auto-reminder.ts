export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.NOTIFY_EMAIL;

    if (!apiKey || !senderEmail) {
      console.error("Missing Brevo environment variables");
      return NextResponse.json(
        { success: false, message: "Email configuration error" },
        { status: 500 }
      );
    }

    const today = new Date();
    const in7days = new Date(today.getTime() + 7 * 86400000).toISOString();

    // ⭐ Fetch companies due within 7 days
    const { data, error } = await supabaseAdmin
      .from("Companies")
      .select("id, name, renewal_date, email")
      .not("renewal_date", "is", null)
      .lte("renewal_date", in7days)
      .gte("renewal_date", today.toISOString());

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Database query failed" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No companies due within 7 days",
      });
    }

    let sentCount = 0;

    // ⭐ Loop through companies and send Brevo email
    for (const c of data) {
      try {
        const html = `
          <h2>Renewal Reminder</h2>
          <p>Hello <strong>${c.name}</strong>,</p>
          <p>Your renewal is due on <strong>${
            c.renewal_date
              ? new Date(c.renewal_date).toLocaleDateString()
              : "Unknown"
          }</strong>.</p>
          <p>Please renew to avoid service interruption.</p>
        `;

        const payload = {
          sender: {
            name: "CentralCore Renewals",
            email: senderEmail,
          },
          to: [{ email: c.email || senderEmail }], // fallback
          subject: "Your Renewal is Due Soon",
          htmlContent: html,
        };

        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) sentCount++;
        else console.error("Brevo error for company:", c.id, await res.text());
      } catch (err) {
        console.error("Email send error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      message: `Auto reminders sent to ${sentCount} companies`,
    });
  } catch (err: any) {
    console.error("Auto-reminder fatal error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
