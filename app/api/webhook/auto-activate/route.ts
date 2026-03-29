import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestKey, machineId, licenseKey, secret } = body;

    // Validate webhook secret
    if (secret !== process.env.WINDOWS_APP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseServer();

    // 1. Find pending license request
    const { data: licenseRequest, error: requestError } = await supabase
      .from("license_requests")
      .select("*")
      .eq("requestKey", requestKey)
      .eq("status", "PENDING")
      .single();

    if (requestError || !licenseRequest) {
      return NextResponse.json(
        { error: "Pending license request not found" },
        { status: 404 }
      );
    }

    // 2. Find pending license tied to request + machine
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*")
      .eq("licenseRequestId", licenseRequest.id)
      .eq("machineId", machineId)
      .eq("status", "PENDING")
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        { error: "Pending license not found" },
        { status: 404 }
      );
    }

    // 3. Activate license
    const { error: updateLicenseError } = await supabase
      .from("licenses")
      .update({
        licenseKey,
        status: "ACTIVE",
        activatedAt: new Date().toISOString(),
      })
      .eq("id", license.id);

    if (updateLicenseError) {
      console.error("License update error:", updateLicenseError.message);
      return NextResponse.json(
        { error: "Failed to activate license" },
        { status: 500 }
      );
    }

    // 4. Mark license request as approved
    const { error: updateRequestError } = await supabase
      .from("license_requests")
      .update({
        status: "APPROVED",
        processedAt: new Date().toISOString(),
      })
      .eq("id", licenseRequest.id);

    if (updateRequestError) {
      console.error("License request update error:", updateRequestError.message);
      return NextResponse.json(
        { error: "Failed to update license request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
