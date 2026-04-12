import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    let { requestKey, productName, notes } = body as {
      requestKey?: string;
      productName?: string;
      notes?: string;
    };

    requestKey = (requestKey || "").trim();
    productName = (productName || "").trim();
    notes = notes ? notes.trim() : undefined;

    if (!requestKey) {
      return NextResponse.json(
        { error: "Missing machine/request key" },
        { status: 400 }
      );
    }

    if (requestKey.length > 500) {
      return NextResponse.json(
        { error: "Request key is too long" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // AUTH CHECK
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("AUTH ERROR:", authError);
    }

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // FETCH CLIENT PROFILE
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (clientError || !client) {
      console.error("CLIENT FETCH ERROR:", clientError);
      return NextResponse.json(
        { error: "Client profile not found. Please contact support." },
        { status: 404 }
      );
    }

    // PREVENT DUPLICATE PENDING REQUESTS FOR SAME KEY
    const { data: existing, error: existingError } = await supabase
      .from("license_requests")
      .select("id")
      .eq("client_id", client.id)
      .eq("request_key", requestKey)
      .eq("status", "pending")
      .maybeSingle();

    if (existingError) {
      console.error("DUPLICATE CHECK ERROR:", existingError);
    }

    if (existing) {
      return NextResponse.json(
        { error: "You already submitted this request key." },
        { status: 400 }
      );
    }

    // SAVE REQUEST
    const { data: requestRecord, error: insertError } = await supabase
      .from("license_requests")
      .insert({
        client_id: client.id,
        request_key: requestKey,
        product_name: productName || "Unknown Product",
        notes: notes || null,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !requestRecord) {
      console.error("REQUEST INSERT ERROR:", insertError);
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }

    // SEND EMAIL (non‑fatal if it fails)
    try {
      await sendMail({
        to: "info@ctistech.com",
        subject: "New License Activation Request",
        html: `
          <h2>New License Activation Request</h2>
          <p><strong>Client:</strong> ${client.email}</p>
          <p><strong>Product:</strong> ${requestRecord.product_name}</p>
          <p><strong>Request Key:</strong></p>
          <pre>${requestKey}</pre>
        `,
      });
    } catch (mailErr) {
      console.error("MAIL SEND ERROR:", mailErr);
      // Do not fail the whole request because of email
    }

    return NextResponse.json({
      success: true,
      message: "License request submitted.",
      request: requestRecord,
    });
  } catch (err: any) {
    console.error("LICENSE REQUEST SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
