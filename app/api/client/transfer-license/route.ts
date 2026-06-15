import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

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

    // 1️⃣ Validate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2️⃣ Confirm old license exists and belongs to this user
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

    // 3️⃣ Ensure new request-key is not already used
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

    // 4️⃣ Create new transfer request
    const { error: insertErr } = await supabase.from("LicenseRequest").insert({
      userId: oldReq.userId,
      clientId: oldReq.clientId,
      productName: productName ?? oldReq.productName,
      requestKey: newRequestKey,
      licenseKey: oldLicenseKey,
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
