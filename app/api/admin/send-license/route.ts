import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { licenseApprovedTemplate } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { email, productName, requestKey } = await req.json();

    if (!email || !productName || !requestKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin; // FIXED: no parentheses

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
      .from("User")
      .select("id, tenantId, email")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Generate license key
    const licenseKey = crypto.randomUUID().replace(/-/g, "").toUpperCase();

    // 3. Insert license into License table
    const { data: license, error: licError } = await supabase
      .from("License")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        tenantId: user.tenantId,
        productName,
        requestKey,
        licenseKey,
        status: "ACTIVE",
      })
      .select("*")
      .single();

    if (licError || !license) {
      console.error("License insert error:", licError);
      return NextResponse.json(
        { error: "Failed to create license" },
        { status: 500 }
      );
    }

    // 4. Insert audit log
    await supabase.from("AuditLog").insert({
      id: crypto.randomUUID(),
      action: "LICENSE_SENT",
      details: `License sent to ${user.email} for ${productName}`,
      userId: user.id,
    });

    // 5. Send email to client
    await sendEmail({
      to: user.email,
      subject: "Your License Key",
      html: licenseApprovedTemplate({
        productName: productName ?? "Unknown Product",
        licenseKey,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "License sent successfully",
      license,
    });
  } catch (err) {
    console.error("Send License Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
