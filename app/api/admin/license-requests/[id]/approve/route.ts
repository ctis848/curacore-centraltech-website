import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { manualKey } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing request ID" },
        { status: 400 }
      );
    }

    if (!manualKey || !manualKey.trim()) {
      return NextResponse.json(
        { success: false, message: "License key is required" },
        { status: 400 }
      );
    }

    const trimmedKey = manualKey.trim();

    // Load request
    const { data: request, error: reqError } = await supabaseAdmin
      .from("LicenseRequest")
      .select("id, userId, productName, requestKey, status, companyName")
      .eq("id", id)
      .single();

    if (reqError || !request) {
      return NextResponse.json(
        { success: false, message: "License request not found" },
        { status: 404 }
      );
    }

    // Load user email
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("email")
      .eq("id", request.userId)
      .single();

    const userEmail = user?.email ?? null;

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Request already processed" },
        { status: 400 }
      );
    }

    // Create License
    const { data: license, error: licError } = await supabaseAdmin
      .from("License")
      .insert({
        userId: request.userId,
        productName: request.productName,
        licenseKey: trimmedKey,
        status: "ACTIVE",
        expiresAt: null,
      })
      .select()
      .single();

    if (licError || !license) {
      return NextResponse.json(
        { success: false, message: licError?.message || "Failed to create license" },
        { status: 500 }
      );
    }

    // Update LicenseRequest
    await supabaseAdmin
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        processedat: new Date().toISOString(),
        processedby: "ADMIN",
        requestKey: trimmedKey,
        notes: "Manual license key issued",
        userEmail: userEmail,
      })
      .eq("id", id);

    // Link to ApprovedLicense
    await supabaseAdmin
      .from("ApprovedLicense")
      .insert({
        licenseRequestId: id,
        licenseId: license.id,
      });

    // Send email
    if (userEmail) {
      try {
        await sendEmail({
          to: userEmail,
          subject: "Your License Has Been Approved",
          html: `
            <h2>Your License is Ready</h2>
            <p>Product: <strong>${request.productName}</strong></p>
            <p>Your license key:</p>
            <p style="font-size:18px;font-weight:bold;color:#0a7d32;">
              ${trimmedKey}
            </p>
          `,
        });
      } catch (err) {
        console.error("Email failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: { request, license },
    });
  } catch (err: any) {
    console.error("Approve license request error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message ?? "Unexpected server error while approving",
      },
      { status: 500 }
    );
  }
}
