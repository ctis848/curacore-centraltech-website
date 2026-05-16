// app/api/admin/license-requests/[id]/approve/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const requestId = context.params.id;

    // 1. Load the license request
    const { data: request, error: reqError } = await supabaseAdmin
      .from("LicenseRequest")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqError || !request) {
      return NextResponse.json(
        { error: "License request not found" },
        { status: 404 }
      );
    }

    // 2. Prevent double approval
    if (request.status === "APPROVED") {
      return NextResponse.json(
        { error: "Request already approved" },
        { status: 400 }
      );
    }

    // 3. Mark request as approved
    const { error: updateError } = await supabaseAdmin
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        approved_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Approval update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update request status" },
        { status: 500 }
      );
    }

    // 4. Insert audit log (FIXED)
    await supabaseAdmin.from("AuditLog").insert({
      id: crypto.randomUUID(),
      action: "LICENSE_REQUEST_APPROVED",
      details: `Approved license request for ${request.userEmail}`,
      user_id: request.userId ?? null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Request approved successfully",
    });
  } catch (err) {
    console.error("Approval API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
