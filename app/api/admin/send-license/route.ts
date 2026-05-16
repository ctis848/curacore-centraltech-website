// app/api/admin/send-license/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { licenseApprovedTemplate } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { requestId, requestKey, licenseKey } = await req.json();

    if (!requestId || !requestKey || !licenseKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // 1. Load the license request
    const { data: request, error: reqError } = await supabase
      .from("LicenseRequest")
      .select("userEmail, companyname, productName")
      .eq("id", requestId)
      .single();

    if (reqError || !request) {
      console.error("LicenseRequest load error:", reqError);
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const email = request.userEmail;
    const productName = request.productName;

    if (!email) {
      return NextResponse.json(
        { error: "Request has no email" },
        { status: 400 }
      );
    }

    // 2. Find user in auth.users
    const { data: authList, error: authListError } =
      await supabase.auth.admin.listUsers();

    if (authListError || !authList) {
      console.error("Auth list error:", authListError);
      return NextResponse.json(
        { error: "Failed to load users" },
        { status: 500 }
      );
    }

    const authUser = authList.users.find((u) => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        { error: "User not found in auth" },
        { status: 404 }
      );
    }

    // 3. Load or create profile in public.User
    let { data: userRow, error: userError } = await supabase
      .from("User")
      .select("id, tenant_id, email")
      .eq("id", authUser.id)
      .single();

    if (userError && userError.code !== "PGRST116") {
      console.error("User profile query error:", userError);
    }

    if (!userRow) {
      const { data: newProfile, error: profileError } = await supabase
        .from("User")
        .insert({
          id: authUser.id,
          email: authUser.email,
          tenant_id: null,
          created_at: new Date().toISOString(),
        })
        .select("id, tenant_id, email")
        .single();

      if (profileError || !newProfile) {
        console.error("Profile creation error:", profileError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }

      userRow = newProfile;
    }

    const profile = userRow as {
      id: string;
      tenant_id: string | null;
      email: string;
    };

    // 4. Insert license
    const { data: license, error: licError } = await supabase
      .from("License")
      .insert({
        id: crypto.randomUUID(),
        user_id: profile.id,
        tenant_id: profile.tenant_id,
        productName,
        requestKey,
        licenseKey,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (licError || !license) {
      console.error("License insert error:", licError);
      return NextResponse.json(
        { error: "Failed to create license" },
        { status: 500 }
      );
    }

    // 5. Insert audit log
    await supabase.from("AuditLog").insert({
      id: crypto.randomUUID(),
      action: "LICENSE_SENT",
      details: `License sent to ${profile.email} for ${productName}`,
      user_id: profile.id,
      created_at: new Date().toISOString(),
    });

    // 6. Send email
    await sendEmail({
      to: profile.email,
      subject: "Your License Key",
      html: licenseApprovedTemplate({
        productName,
        licenseKey,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "License sent successfully",
      license,
    });

  } catch (err) {
    console.error("Send License Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
