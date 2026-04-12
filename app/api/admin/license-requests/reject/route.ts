import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId, reason } = body || {};

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing requestId" },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Load request
    const { data: request, error: reqError } = await supabaseAdmin
      .from("license_requests")
      .select("id, user_id, status, product_name")
      .eq("id", requestId)
      .single();

    if (reqError || !request) {
      return NextResponse.json(
        { error: "License request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending requests can be rejected" },
        { status: 400 }
      );
    }

    // Update request status
    const { error: updateError } = await supabaseAdmin
      .from("license_requests")
      .update({
        status: "REJECTED",
        rejection_reason: reason,
        processed_at: new Date().toISOString(),
        processed_by: "ADMIN",
      })
      .eq("id", requestId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update request" },
        { status: 500 }
      );
    }

    // Notify user by email
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        request.user_id
      );

      const email = userData?.user?.email;

      if (email && process.env.MAIL_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT),
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"CentralTech Licensing" <${process.env.MAIL_USER}>`,
          to: email,
          subject: "License Request Rejected",
          html: `
            <h2>Your License Request Was Rejected</h2>
            <p><strong>Reason:</strong></p>
            <p>${reason}</p>
          `,
        });
      }
    } catch (emailErr) {
      console.error("EMAIL SEND ERROR:", emailErr);
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "LICENSE_REJECTED",
      details: `Rejected license request #${requestId}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "License request rejected successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
