import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { licenseKey, machineId } = await req.json();

    if (!licenseKey || !machineId) {
      return NextResponse.json(
        { error: "Missing licenseKey or machineId" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1. Find license
    const { data: lic } = await supabase
      .from("License")
      .select("*")
      .eq("licenseKey", licenseKey)
      .single();

    if (!lic) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 404 }
      );
    }

    // 2. Check expiration
    if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "License expired" },
        { status: 403 }
      );
    }

    // 3. Check activation limit
    if (lic.activationCount >= lic.maxActivations) {
      return NextResponse.json(
        { error: "Activation limit reached" },
        { status: 403 }
      );
    }

    // 4. Record activation
    await supabase
      .from("License")
      .update({
        activationCount: lic.activationCount + 1,
        activatedAt: new Date(),
      })
      .eq("id", lic.id);

    // 5. Save machine history
    await supabase.from("MachineHistory").insert({
      licenseId: lic.id,
      machineId,
      activatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
