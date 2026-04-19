import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing license ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Load license + request key
    const { data: license, error } = await supabase
      .from("License")
      .select(`
        id,
        productName,
        licenseKey,
        userId,
        license_request:LicenseRequest (
          requestKey
        )
      `)
      .eq("id", id)
      .single();

    if (error || !license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    // ⭐ FIX: Normalize array → single requestKey
    let reqKey: string | null = null;

    if (Array.isArray(license.license_request)) {
      reqKey = license.license_request[0]?.requestKey ?? null;
    } else if (license.license_request) {
      reqKey = (license.license_request as any).requestKey ?? null;
    }

    const content = `PRODUCT=${license.productName}
LICENSE_KEY=${license.licenseKey}
REQUEST_KEY=${reqKey ?? ""}
USER=${license.userId}`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${license.productName}-license.txt"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
