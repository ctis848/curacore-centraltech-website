// FILE: app/api/license-request/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { requestKey, machineId, productName } = await req.json();

    if (!requestKey) {
      return NextResponse.json(
        { error: "requestKey is required" },
        { status: 400 }
      );
    }

    // FIX: cookies() must be awaited in Next.js 16
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Save request
    const { data, error } = await supabaseAdmin
      .from("license_requests")
      .insert({
        user_id: user.id,
        request_key: requestKey,
        machine_id: machineId,
        product_name: productName,
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

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      admin_id: null,
      action: "client_license_request",
      details: {
        user_id: user.id,
        request_id: data.id,
        request_key: requestKey,
        machine_id: machineId,
        product_name: productName,
      },
    });

    // Audit trail
    await supabaseAdmin.from("audit_trails").insert({
      admin_id: null,
      entity: "license_request",
      entity_id: data.id,
      action: "created_by_client",
    });

    // Email notification
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
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>License Key:</strong> ${requestKey}</p>
        <p><strong>Machine ID:</strong> ${machineId}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      requestId: data.id,
    });
  } catch (err) {
    console.error("License request API error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
