import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Next.js 16 cookies() is ASYNC
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

  const { data: license } = await supabase
    .from("License")
    .select("*")
    .eq("id", id)
    .single();

  if (!license) {
    return NextResponse.json({
      success: false,
      message: "License not found",
    });
  }

  const amount = license.annualFeePercent;

  await supabase.from("Invoice").insert({
    userId: license.userId,
    licenseId: license.id,
    amount,
    status: "UNPAID",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: "Annual fee invoice generated.",
  });
}
