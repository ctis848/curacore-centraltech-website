import { NextResponse } from "next/server";
import { createServerDbClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestKey, machineId, licenseKey, secret } = body;

    if (secret !== process.env.WINDOWS_APP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await createServerDbClient();

    // Find pending license request by requestKey
    const licenseRequest = await db.licenseRequest.findFirst({
      where: {
        requestKey,
        status: "PENDING",
      },
    });

    if (!licenseRequest) {
      return NextResponse.json(
        { error: "Pending license request not found" },
        { status: 404 }
      );
    }

    // Find license tied to that request + machine
    const license = await db.license.findFirst({
      where: {
        licenseRequestId: licenseRequest.id,
        machineId,
        status: "PENDING",
      },
    });

    if (!license) {
      return NextResponse.json(
        { error: "Pending license not found" },
        { status: 404 }
      );
    }

    await db.license.update({
      where: { id: license.id },
      data: {
        licenseKey,
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    await db.licenseRequest.update({
      where: { id: licenseRequest.id },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
