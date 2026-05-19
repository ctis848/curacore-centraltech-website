import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      userEmail,
      companyName,
      productName,
      requestKey,
      notes,
    } = body;

    // -------------------------------
    // VALIDATION
    // -------------------------------
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    if (!userEmail) return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    if (!companyName) return NextResponse.json({ error: "Missing companyName" }, { status: 400 });
    if (!productName) return NextResponse.json({ error: "Missing productName" }, { status: 400 });
    if (!requestKey) return NextResponse.json({ error: "Missing requestKey" }, { status: 400 });

    // -------------------------------
    // INSERT INTO LicenseRequest TABLE
    // -------------------------------
    const newId = randomUUID();

    const { data, error } = await supabaseAdmin
      .from("LicenseRequest")
      .insert({
        id: newId,
        userId,
        userEmail,
        companyName,
        companyname: companyName, // your schema has both
        productName,
        requestKey,
        notes: notes || null,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      console.error("🔥 SUPABASE INSERT ERROR:", error);
      return NextResponse.json(
        { error: "Failed to save license request" },
        { status: 500 }
      );
    }

    // -------------------------------
    // RETURN SUCCESS IMMEDIATELY
    // -------------------------------
    const response = NextResponse.json({
      success: true,
      message: "License request submitted successfully",
      data,
    });

    // -------------------------------
    // SEND EMAILS USING BREVO DIRECTLY
    // -------------------------------
    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL; // same as contact API

    if (!apiKey || !notifyEmail) {
      console.error("Missing Brevo API environment variables");
      return response; // still return success
    }

    // ADMIN EMAIL
    const adminPayload = {
      sender: {
        name: "CTIS License System",
        email: notifyEmail,
      },
      to: [{ email: notifyEmail }],
      subject: "New License Request Key Submitted",
      htmlContent: `
        <h2>New License Request</h2>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Product Plan:</strong> ${productName}</p>
        <p><strong>Request Key:</strong></p>
        <pre>${requestKey}</pre>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
      `,
    };

    // CLIENT EMAIL
    const clientPayload = {
      sender: {
        name: "CTIS License System",
        email: notifyEmail,
      },
      to: [{ email: userEmail }],
      subject: "Your License Request Has Been Received",
      htmlContent: `
        <h2>License Request Received</h2>
        <p>Hello ${companyName},</p>
        <p>Your license request has been received and is being processed.</p>
        <p><strong>Product Plan:</strong> ${productName}</p>
        <p><strong>Request Key:</strong></p>
        <pre>${requestKey}</pre>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
      `,
    };

    // SEND EMAILS IN BACKGROUND
    (async () => {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adminPayload),
        });
      } catch (err) {
        console.error("🔥 ADMIN EMAIL ERROR:", err);
      }

      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientPayload),
        });
      } catch (err) {
        console.error("🔥 CLIENT EMAIL ERROR:", err);
      }
    })();

    return response;

  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error submitting license request" },
      { status: 500 }
    );
  }
}
