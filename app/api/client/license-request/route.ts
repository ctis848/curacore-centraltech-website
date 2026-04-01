import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { requestKey, productName, notes } = await req.json();

    if (!requestKey) {
      return NextResponse.json(
        { error: "Missing machine/request key" },
        { status: 400 }
      );
    }

    // AUTH CHECK
    const supabase = supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // PREVENT DUPLICATE PENDING REQUESTS
    const { data: existing } = await supabase
      .from("license_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("request_key", requestKey)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You already submitted this request key. Await admin processing.",
        },
        { status: 400 }
      );
    }

    // CREATE LICENSE REQUEST
    const { data: requestRecord, error: insertError } = await supabase
      .from("license_requests")
      .insert({
        user_id: user.id,
        request_key: requestKey,
        product_name: productName || "Unknown Product",
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }

    // SEND EMAIL TO ADMIN
    await sendMail({
      to: "info@ctistech.com",
      subject: "New License Activation Request",
      html: `
        <h2>New License Activation Request</h2>

        <p><strong>User:</strong> ${user.email}</p>

        <p><strong>Request Key:</strong></p>
        <pre style="padding:10px;background:#f4f4f4;border-radius:6px;">
${requestKey}
        </pre>

        ${
          productName
            ? `<p><strong>Product:</strong> ${productName}</p>`
            : ""
        }

        ${
          notes
            ? `<p><strong>Notes:</strong> ${notes}</p>`
            : ""
        }

        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>

        <p>Admin Panel:</p>
        <a href="https://www.ctistech.com/admin/license-requests">
          View License Requests
        </a>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "License request submitted. Admin will generate your license.",
      request: requestRecord,
    });
  } catch (err: any) {
    console.error("License request error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
