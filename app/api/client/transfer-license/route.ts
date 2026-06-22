import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "support@ctistech.com";

async function sendAdminEmail(payload: {
  userEmail: string;
  productName: string;
  companyName: string;
  oldLicenseKey: string;
  newRequestKey: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>New License Transfer Request</h2>

      <p>A client has submitted a license transfer request. Details are below:</p>

      <p><strong>User Email:</strong> ${payload.userEmail}</p>
      <p><strong>Company:</strong> ${payload.companyName}</p>
      <p><strong>Product:</strong> ${payload.productName}</p>
      <p><strong>Old License Key:</strong> ${payload.oldLicenseKey}</p>
      <p><strong>New Request Key:</strong> ${payload.newRequestKey}</p>

      <p>Please log in to the Admin Portal to review and approve this request.</p>

      <br/>
      <p>— CTIS License System</p>
    </div>
  `;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "CTIS License System", email: ADMIN_EMAIL },
      to: [{ email: ADMIN_EMAIL }],
      subject: "New License Transfer Request",
      htmlContent: html,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const { oldLicenseKey, newRequestKey, productName, companyName } =
      await req.json();

    if (!oldLicenseKey || !newRequestKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Old license key and new request-key are required.",
        },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Validate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      );
    }

    // Confirm old license exists
    const { data: oldReq, error: oldErr } = await supabase
      .from("LicenseRequest")
      .select("*")
      .eq("licenseKey", oldLicenseKey)
      .eq("userEmail", user.email)
      .eq("status", "APPROVED")
      .maybeSingle();

    if (oldErr || !oldReq) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Old license key not found or does not belong to your account.",
        },
        { status: 404 }
      );
    }

    // Ensure new request-key is not already used
    const { data: existingReq } = await supabase
      .from("LicenseRequest")
      .select("id")
      .eq("requestKey", newRequestKey)
      .maybeSingle();

    if (existingReq) {
      return NextResponse.json(
        {
          success: false,
          message: "This request-key has already been used.",
        },
        { status: 400 }
      );
    }

    // Create new transfer request
    const { error: insertErr } = await supabase.from("LicenseRequest").insert({
      id: crypto.randomUUID(),
      userId: oldReq.userId,
      clientId: oldReq.clientId,
      productName: productName ?? oldReq.productName,
      requestKey: newRequestKey.trim(),
      licenseKey: oldLicenseKey.trim(),
      status: "PENDING",
      notes: "TRANSFER REQUEST",
      userEmail: user.email,
      companyName: companyName ?? oldReq.companyName,
    });

    if (insertErr) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit transfer request.",
        },
        { status: 500 }
      );
    }

    // ⭐ SEND EMAIL TO ADMIN
    await sendAdminEmail({
      userEmail: user.email,
      productName: productName ?? oldReq.productName,
      companyName: companyName ?? oldReq.companyName,
      oldLicenseKey,
      newRequestKey,
    });

    return NextResponse.json({
      success: true,
      message:
        "Transfer request submitted successfully. Admin will review and approve.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message ?? "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
