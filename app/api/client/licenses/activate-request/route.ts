import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();

    // Parse body
    const { licenseKey, machineId } = await req.json();

    if (!licenseKey || !machineId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // AUTH: Get logged‑in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch client record
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, email, name")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );
    }

    // Check if license exists
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("id, license_key")
      .eq("license_key", licenseKey)
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 400 }
      );
    }

    // Prevent duplicate pending requests
    const { data: existing } = await supabase
      .from("license_requests")
      .select("id")
      .eq("license_key", licenseKey)
      .eq("machine_id", machineId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A pending request already exists for this machine." },
        { status: 409 }
      );
    }

    // Create activation request
    const { data: requestRecord, error: createError } = await supabase
      .from("license_requests")
      .insert({
        user_id: client.id,
        email: client.email,
        license_key: licenseKey,
        machine_id: machineId,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Create request error:", createError);
      return NextResponse.json(
        { error: "Failed to create activation request" },
        { status: 500 }
      );
    }

    // Send email to admin
    try {
      await sendMail({
        to: "info@ctistech.com",
        subject: "New License Activation Request",
        html: `
          <h2>New Activation Request</h2>
          <p><strong>User:</strong> ${client.email}</p>
          <p><strong>License Key:</strong> ${licenseKey}</p>
          <p><strong>Machine ID:</strong> ${machineId}</p>
          <p>View in Admin Panel:</p>
          <a href="https://www.ctistech.com/admin/license-requests">Open Admin Panel</a>
        `,
      });
    } catch (mailError) {
      console.error("Email send error:", mailError);
      // Do NOT fail the request — email is best‑effort
    }

    // Create notification for client
    await supabase.from("notifications").insert({
      user_id: client.id,
      title: "Activation Request Submitted",
      message: `Your activation request for license ${licenseKey} has been submitted.`,
      created_at: new Date().toISOString(),
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: "Activation request submitted successfully.",
      request: requestRecord,
    });
  } catch (error) {
    console.error("Activation request error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
