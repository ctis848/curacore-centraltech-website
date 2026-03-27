import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { license_key, machine_id } = body;

  if (!license_key || !machine_id) {
    return NextResponse.json(
      { error: "license_key and machine_id are required" },
      { status: 400 }
    );
  }

  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", license_key)
    .single();

  if (licenseError || !license) {
    return NextResponse.json(
      { valid: false, reason: "License not found" },
      { status: 404 }
    );
  }

  if (!license.active) {
    return NextResponse.json(
      { valid: false, reason: "License is inactive" },
      { status: 403 }
    );
  }

  const { data: machine, error: machineError } = await supabase
    .from("machines")
    .select("*")
    .eq("license_id", license.id)
    .eq("machine_id", machine_id)
    .single();

  if (machineError || !machine) {
    return NextResponse.json(
      { valid: false, reason: "Machine not registered for this license" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    valid: true,
    license_id: license.id,
    machine_id: machine.machine_id,
  });
}
