import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { licenseApprovedTemplate } from "@/lib/email/templates";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;
  const requestId = params.id;

  // 1. Fetch the license request
  const { data: request, error } = await supabase
    .from("LicenseRequest")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // 2. Fetch the user
  const { data: user } = await supabase
    .from("User")
    .select("id, tenantId, email")
    .eq("id", request.userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 3. Generate license key
  const licenseKey = crypto.randomUUID().replace(/-/g, "").toUpperCase();

  // 4. Insert license
  const { data: license, error: licError } = await supabase
    .from("License")
    .insert({
      id: crypto.randomUUID(),
      userId: user.id,
      tenantId: user.tenantId,
      productName: request.productName,
      requestKey: request.requestKey,
      licenseKey,
      status: "ACTIVE",
    })
    .select("*")
    .single();

  if (licError || !license) {
    return NextResponse.json(
      { error: "Failed to create license" },
      { status: 500 }
    );
  }

  // 5. Update request status
  await supabase
    .from("LicenseRequest")
    .update({
      status: "APPROVED",
      processedAt: new Date().toISOString(),
      processedBy: "ADMIN",
    })
    .eq("id", requestId);

  // 6. Audit log
  await supabase.from("AuditLog").insert({
    id: crypto.randomUUID(),
    action: "LICENSE_APPROVED_AND_SENT",
    details: `Approved and sent license for ${user.email}`,
    userId: user.id,
  });

  // 7. Send email
  await sendEmail({
    to: user.email,
    subject: "Your License Has Been Approved",
    html: licenseApprovedTemplate({
      productName: request.productName,
      licenseKey,
    }),
  });

  return NextResponse.redirect("/admin/license-requests");
}
