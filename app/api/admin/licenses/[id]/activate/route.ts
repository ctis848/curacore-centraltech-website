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

  const { error } = await supabase
    .from("License")
    .update({ status: "ACTIVE" })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to activate license." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "License activated successfully.",
  });
}
