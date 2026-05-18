import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

function generateLicenseKey() {
  return crypto.randomUUID().toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { requestKey, adminId } = await req.json();

    if (!requestKey) {
      return NextResponse.json(
        { success: false, error: "Missing requestKey" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Load request
    const { data: request } = await supabase
      .from("LicenseRequest")
      .select("*")
      .eq("requestKey", requestKey)
      .single();

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Generate license key
    const licenseKey = generateLicenseKey();

    // Save license to your License table
    const { error: licenseError } = await supabase
      .from("License")
      .insert({
        companyId: request.userId,
        licenseKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (licenseError) {
      return NextResponse.json(
        { success: false, error: "Failed to save license" },
        { status: 500 }
      );
    }

    // Update request status
    await supabase
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        processedAt: new Date().toISOString(),
        processedBy: adminId || null,
      })
      .eq("requestKey", requestKey);

    // Send license email
    sendEmail({
      to: request.userEmail,
      subject: "Your License Has Been Approved",
      html: `
        <h2>Your License is Ready</h2>
        <p><strong>Company:</strong> ${request.companyname}</p>
        <p><strong>License Key:</strong> ${licenseKey}</p>
        <p>Thank you for choosing CentralCore.</p>
      `,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      licenseKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
