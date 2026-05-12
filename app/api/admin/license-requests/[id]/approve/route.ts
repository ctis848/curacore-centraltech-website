import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  const id = params.id;
  const { manualKey } = await req.json();

  if (!manualKey || !manualKey.trim()) {
    return NextResponse.json(
      { success: false, message: "License key is required" },
      { status: 400 }
    );
  }

  // 1) Load request using SAME RPC as UI
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
    "get_license_requests_with_email"
  );

  if (rpcError) {
    return NextResponse.json(
      { success: false, message: rpcError.message },
      { status: 500 }
    );
  }

  const request = (rpcData || []).find((r: any) => r.id === id);

  if (!request) {
    return NextResponse.json(
      { success: false, message: "License request not found" },
      { status: 404 }
    );
  }

  // 2) Validate status
  if (request.status !== "PENDING") {
    return NextResponse.json(
      { success: false, message: "Request already processed" },
      { status: 400 }
    );
  }

  // 3) Create License
  const { data: license, error: licError } = await supabaseAdmin
    .from("License")
    .insert({
      userId: request.userId,
      productName: request.productName,
      licenseKey: manualKey.trim(),
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

  // 4) Update LicenseRequest
  await supabaseAdmin
    .from("LicenseRequest")
    .update({
      status: "APPROVED",
      processedAt: new Date().toISOString(),
      processedBy: "ADMIN",
      requestKey: manualKey.trim(),
      notes: "Manual license key issued",
    })
    .eq("id", id);

  // 5) Link to ApprovedLicense
  await supabaseAdmin.from("ApprovedLicense").insert({
    licenseRequestId: id,
    licenseId: license.id,
  });

  // 6) Send email
  if (request.userEmail) {
    try {
      await sendEmail({
        to: request.userEmail,
        subject: "Your License Has Been Approved",
        html: `
          <h2>Your License is Ready</h2>
          <p>Product: <strong>${request.productName}</strong></p>
          <p>Your license key:</p>
          <p style="font-size:18px;font-weight:bold;color:#0a7d32;">
            ${manualKey.trim()}
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
}
