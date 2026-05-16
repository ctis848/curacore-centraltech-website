import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { licenseApprovedTemplate } from "@/lib/email/templates";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    // Load request
    const { data: request, error } = await supabaseAdmin
      .from("LicenseRequest")
      .select("*")
      .eq("id", requestId)
      .single();

    if (error || !request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Load user
    const { data: user, error: userError } = await supabaseAdmin
      .from("User")
      .select("id, tenantId, email")
      .eq("id", request.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate license key
    const licenseKey = crypto.randomUUID().replace(/-/g, "").toUpperCase();

    // Create license
    const { data: license, error: licError } = await supabaseAdmin
      .from("License")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        tenantId: user.tenantId,
        productName: request.productName,
        requestKey: request.requestKey,
        licenseKey,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (licError || !license) {
      console.error("License creation error:", licError);
      return NextResponse.json(
        { error: "Failed to create license" },
        { status: 500 }
      );
    }

    // Update request
    await supabaseAdmin
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        processedAt: new Date().toISOString(),
        processedBy: "ADMIN",
      })
      .eq("id", requestId);

    // Audit log
    await supabaseAdmin.from("AuditLog").insert({
      id: crypto.randomUUID(),
      action: "LICENSE_APPROVED_AND_SENT",
      details: `Approved and sent license for ${user.email}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Your License Has Been Approved",
      html: licenseApprovedTemplate({
        productName: request.productName,
        licenseKey,
      }),
    });

    return NextResponse.redirect("/admin/license-requests");
  } catch (err) {
    console.error("Approve-Send Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
