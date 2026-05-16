import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const requestId = params.id;

  // Fetch the request
  const { data: request, error } = await supabaseAdmin
    .from("LicenseRequest")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Generate license key (simple example)
  const licenseKey = crypto.randomUUID();

  // Insert license
  await supabaseAdmin.from("License").insert({
    id: crypto.randomUUID(),
    userId: request.userId,
    productName: request.productName,
    licenseKey,
    status: "ACTIVE",
  });

  // Update request status
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
    action: "LICENSE_APPROVED",
    details: `Approved license request for ${request.userEmail}`,
    userId: request.userId,
  });

  // Send email
  await resend.emails.send({
    from: "CentralCore <noreply@centralcore.com>",
    to: request.userEmail,
    subject: "Your License Has Been Approved",
    html: `
      <p>Hello,</p>
      <p>Your license request for <strong>${request.productName}</strong> has been approved.</p>
      <p>Your license key:</p>
      <pre>${licenseKey}</pre>
      <p>Thank you.</p>
    `,
  });

  return NextResponse.redirect("/admin/license-requests");
}
