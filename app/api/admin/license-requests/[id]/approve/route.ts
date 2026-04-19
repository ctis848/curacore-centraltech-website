// FILE: app/api/admin/license-requests/[id]/approve/route.ts

import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin"; // SERVICE ROLE CLIENT
import { sendEmail } from "@/lib/email/send";
import { licenseKeyDeliveredTemplate } from "@/lib/email/templates/licenseKeyDelivered";
import { generateLicenseKey } from "@/lib/license/generator";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const { manualKey } = await req.json(); // admin may paste a key

    // 1. Fetch the license request + user email
    const { data: request, error: requestError } = await admin
      .from("LicenseRequest")
      .select("*, User(email)")
      .eq("id", id)
      .single();

    if (requestError || !request) {
      return NextResponse.json(
        { success: false, message: "License request not found" },
        { status: 404 }
      );
    }

    // 2. Determine license key (manual or auto-generated)
    const licenseKey = manualKey?.trim() || generateLicenseKey();

    // 3. Create license record
    const licenseId = crypto.randomUUID();

    const { error: licenseError } = await admin.from("License").insert({
      id: licenseId,
      userId: request.userId,
      productName: request.productName,
      licenseKey,
      activationCount: 0,
      annualFeePercent: 20,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (licenseError) {
      return NextResponse.json(
        { success: false, message: licenseError.message },
        { status: 500 }
      );
    }

    // 4. Update request status
    await admin
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        processedAt: new Date().toISOString(),
        processedBy: "ADMIN",
      })
      .eq("id", id);

    // 5. Send license key email to client
    const userEmail = request.User?.email;

    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: "Your License Key",
        html: licenseKeyDeliveredTemplate(licenseKey, request.productName),
      });
    }

    return NextResponse.json({
      success: true,
      message: "License approved and key sent to client.",
    });

  } catch (err: any) {
    console.error("APPROVE LICENSE ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
