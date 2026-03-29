// FILE: app/api/license-request/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { requestKey } = await req.json();

    if (!requestKey) {
      return NextResponse.json(
        { error: "requestKey is required" },
        { status: 400 }
      );
    }

    // 1. Get authenticated user (client)
    const supabase = supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Save request in database
    const { data, error } = await supabaseAdmin
      .from("license_requests")
      .insert({
        user_id: user.id,
        request_key: requestKey,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json(
        { error: "Failed to save license request" },
        { status: 500 }
      );
    }

    // 3. Log activity
    await supabaseAdmin.from("activity_logs").insert({
      admin_id: null, // client action, no admin yet
      action: "client_license_request",
      details: {
        user_id: user.id,
        request_id: data.id,
        request_key: requestKey,
      },
    });

    // 4. Audit trail
    await supabaseAdmin.from("audit_trails").insert({
      admin_id: null,
      entity: "license_request",
      entity_id: data.id,
      action: "created_by_client",
    });

    // 5. Email your team
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "CentralCore EMR <no-reply@centralcore.com>",
      to: "info@ctistech.com",
      subject: "New License Request",
      html: `
        <h2>New License Request</h2>
        <p>A customer has submitted a license request key:</p>
        <pre>${requestKey}</pre>
        <p>User ID: ${user.id}</p>
        <p>Please generate a license and reply to the customer.</p>
      `,
    });

    // 6. Optional: respond to client with success + id
    return NextResponse.json({
      success: true,
      requestId: data.id,
    });
  } catch (err: any) {
    console.error("License request API error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
