import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendLicenseEmail } from "@/lib/email/sendLicenseEmail";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const body = await req.json();
  const { requestId, newLicenseKey, notes } = body;

  if (!requestId || !newLicenseKey) {
    return NextResponse.json(
      { success: false, message: "requestId and newLicenseKey are required." },
      { status: 400 }
    );
  }

  // Admin user
  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Not authorized." },
      { status: 401 }
    );
  }

  // Fetch request
  const { data: reqRow } = await supabase
    .from("LicenseRequest")
    .select("*")
    .eq("id", requestId)
    .eq("status", "PENDING")
    .maybeSingle();

  if (!reqRow) {
    return NextResponse.json(
      { success: false, message: "Request not found or already processed." },
      { status: 404 }
    );
  }

  const processedAt = new Date().toISOString();

  // Update DB
  await supabase
    .from("LicenseRequest")
    .update({
      status: "APPROVED",
      licenseKey: newLicenseKey,
      processedAt,
      processedBy: admin.id,
      notes: notes ?? reqRow.notes,
    })
    .eq("id", requestId);

  // Send email
  if (reqRow.userEmail) {
    const txtContent = [
      `Product: ${reqRow.productName ?? ""}`,
      `License Key: ${newLicenseKey}`,
      `Request Key: ${reqRow.requestKey ?? ""}`,
      `Company: ${reqRow.companyName ?? ""}`,
      `Email: ${reqRow.userEmail ?? ""}`,
      `Approved At: ${processedAt}`,
    ].join("\r\n");

    const emailResult = await sendLicenseEmail({
      to: reqRow.userEmail,
      subject: `Your new license key for ${reqRow.productName ?? "your product"}`,
      bodyText: `Your license transfer has been approved. Your license file is attached.`,
      txtFilename: `license_${requestId}.txt`,
      txtContent,
    });

    if (emailResult.success) {
      await supabase
        .from("LicenseRequest")
        .update({ sentAt: new Date().toISOString() })
        .eq("id", requestId);
    }
  }

  return NextResponse.json({
    success: true,
    message: "License approved and email sent.",
  });
}
