import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendLicenseEmail } from "@/lib/email/sendLicenseEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId, newLicenseKey, notes } = body;

    if (!requestId || !newLicenseKey) {
      return NextResponse.json(
        { success: false, message: "requestId and newLicenseKey are required." },
        { status: 400 }
      );
    }

    // Fetch the request
    const { data: reqRow, error: fetchError } = await supabaseAdmin
      .from("LicenseRequest")
      .select("*")
      .eq("id", requestId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (fetchError || !reqRow) {
      return NextResponse.json(
        { success: false, message: "Request not found or already processed." },
        { status: 404 }
      );
    }

    const processedAt = new Date().toISOString();

    // Update ONLY safe fields on LicenseRequest
    const { error: updateError } = await supabaseAdmin
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        processedAt,
        notes: notes ?? reqRow.notes,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update request", details: updateError.message },
        { status: 500 }
      );
    }

    // Update licenseKey separately (in case of trigger issues)
    await supabaseAdmin
      .from("LicenseRequest")
      .update({ licenseKey: newLicenseKey })
      .eq("id", requestId);

    // Deactivate old license if it exists
    if (reqRow.licenseKey) {
      await supabaseAdmin
        .from("License")
        .update({ status: "DEACTIVATED" })
        .eq("licenseKey", reqRow.licenseKey);
    }

    // Insert new License
    await supabaseAdmin.from("License").insert({
      licenseRequestId: requestId,
      userId: reqRow.userId,
      productName: reqRow.productName,
      licenseKey: newLicenseKey,
      userEmail: reqRow.userEmail,
      status: "ACTIVE",
      createdAt: processedAt,
    });

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

      await sendLicenseEmail({
        to: reqRow.userEmail,
        subject: `Your new license key for ${reqRow.productName ?? "your product"}`,
        bodyText: "Your license transfer has been approved. Your new license key is attached.",
        txtFilename: `license_${requestId}.txt`,
        txtContent,
      });
    }

    return NextResponse.json({
      success: true,
      message: "License transfer approved successfully.",
    });
  } catch (err: any) {
    console.error("Approve error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", details: err.message },
      { status: 500 }
    );
  }
}