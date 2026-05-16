import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const requestId = params.id;

  const { data: request, error } = await supabaseAdmin
    .from("LicenseRequest")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Update request status
  await supabaseAdmin
    .from("LicenseRequest")
    .update({
      status: "REJECTED",
      processedAt: new Date().toISOString(),
      processedBy: "ADMIN",
    })
    .eq("id", requestId);

  // Audit log
  await supabaseAdmin.from("AuditLog").insert({
    id: crypto.randomUUID(),
    action: "LICENSE_REJECTED",
    details: `Rejected license request for ${request.userEmail}`,
    userId: request.userId,
  });

  // Send email
  await resend.emails.send({
    from: "CentralCore <noreply@centralcore.com>",
    to: request.userEmail,
    subject: "Your License Request Was Rejected",
    html: `
      <p>Hello,</p>
      <p>Your license request for <strong>${request.productName}</strong> has been rejected.</p>
      <p>If you believe this is an error, please contact support.</p>
    `,
  });

  return NextResponse.redirect("/admin/license-requests");
}
