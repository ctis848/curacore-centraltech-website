import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { licenseRequestId, generatedKey } = await req.json();

    if (!licenseRequestId || !generatedKey) {
      return NextResponse.json(
        { success: false, error: "Missing licenseRequestId or generatedKey" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1. Load LicenseRequest
    const { data: reqData, error: reqError } = await supabase
      .from("LicenseRequest")
      .select("id, userId, productName, userEmail")
      .eq("id", licenseRequestId)
      .single();

    if (reqError || !reqData) {
      return NextResponse.json(
        { success: false, error: "LicenseRequest not found" },
        { status: 404 }
      );
    }

    // 2. Ensure we have user email
    let userEmail = reqData.userEmail;

    if (!userEmail) {
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(reqData.userId);

      if (userError || !userData?.user?.email) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      userEmail = userData.user.email;
    }

    const now = new Date();
    const expires = new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    // 3. Check if a License already exists for this user + product
    const { data: existingLicense } = await supabase
      .from("License")
      .select("*")
      .eq("userId", reqData.userId)
      .eq("productName", reqData.productName)
      .maybeSingle();

    // 4. If License exists → UPDATE it
    if (existingLicense) {
      const { error: updateError } = await supabase
        .from("License")
        .update({
          licenseKey: generatedKey,
          licenseRequestId,
          updatedAt: now.toISOString(),
        })
        .eq("id", existingLicense.id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
    }

    // 5. If License does NOT exist → INSERT new License
    else {
      const { error: insertError } = await supabase.from("License").insert({
        id: crypto.randomUUID(),
        userId: reqData.userId,
        productName: reqData.productName ?? "Unknown Product",
        licenseKey: generatedKey,
        licenseRequestId,
        userEmail,
        status: "ACTIVE",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expires,
        activationCount: 0,
        maxActivations: 10,
        annualFeePercent: 20,
      });

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
    }

    // 6. Update LicenseRequest → APPROVED
    const { error: reqUpdateError } = await supabase
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        license_key: generatedKey,
        processedAt: now.toISOString(),
      })
      .eq("id", licenseRequestId);

    if (reqUpdateError) {
      return NextResponse.json(
        { success: false, error: reqUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
