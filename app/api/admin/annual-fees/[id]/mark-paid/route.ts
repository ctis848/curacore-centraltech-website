import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const cookieStore = await cookies();

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
        }
      }
    }
  );

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const { data: license, error: licenseError } = await supabase
    .from("License")
    .update({
      expiryDate: nextYear.toISOString(),
      status: "ACTIVE",
    })
    .eq("id", id)
    .select()
    .single();

  if (licenseError || !license) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update license.",
      },
      { status: 500 }
    );
  }

  const { error: invoiceError } = await supabase
    .from("Invoice")
    .update({ status: "PAID" })
    .eq("licenseId", id)
    .eq("status", "UNPAID");

  if (invoiceError) {
    return NextResponse.json(
      {
        success: false,
        message: "License updated, but failed to update invoice.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "License renewed and invoice marked as paid.",
  });
}
