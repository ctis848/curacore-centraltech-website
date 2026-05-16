// FILE: app/api/admin/license-requests/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("LicenseRequest")
    .select("*")
    .order("requestedAt", { ascending: false });

  if (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: "Failed to load license requests" },
      { status: 500 }
    );
  }

  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  try {
    // ⭐ FIX: cookies() must be awaited in your environment
    const cookieStore = await cookies();

    // ⭐ Correct cookie adapter for your Supabase version
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          },
        },
      }
    );

    // ⭐ Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // ⭐ Parse JSON body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    const { userEmail, companyName, productName, requestKey, notes } = body;

    if (!userEmail || !companyName || !productName || !requestKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ⭐ Insert into LicenseRequest using service role
    const { data, error } = await supabaseAdmin
      .from("LicenseRequest")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        userEmail,
        companyname: companyName,
        productName,
        requestKey,
        notes: notes || null,
        status: "PENDING",
        requestedAt: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create license request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      request: data,
    });

  } catch (err) {
    console.error("Create Request Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
