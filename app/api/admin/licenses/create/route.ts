import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      productName,
      licenseKey,
      maxActivations,
      expiresAt,
    } = body;

    if (!userId || !productName || !licenseKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload = {
      user_id: userId,
      product_name: productName,
      license_key: licenseKey.trim(),
      status: "ACTIVE",
      max_activations: maxActivations || null,
      expires_at: expiresAt || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("licenses")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("LICENSE CREATE ERROR:", error);
      return NextResponse.json(
        { error: "Failed to create license", details: error.message },
        { status: 500 }
      );
    }

    // Optional: Audit log
    await supabaseAdmin.from("audit_logs").insert({
      action: "LICENSE_CREATED_MANUALLY",
      details: `Manual license created for user ${userId}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "License created successfully",
      license: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
