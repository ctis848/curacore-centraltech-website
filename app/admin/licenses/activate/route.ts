import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  // Admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData?.user?.id)
    .single();

  if (!userData?.user || profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const licenseId = formData.get("license_id") as string | null;
  const licenseKey = formData.get("license_key") as string | null;

  if (!licenseId || !licenseKey) {
    return NextResponse.json(
      { error: "Missing license_id or license_key" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("licenses")
    .update({
      license_key: licenseKey,
      status: "active",
      activated_at: new Date().toISOString(),
    })
    .eq("id", licenseId);

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to activate license" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/admin/licenses/pending", req.url));
}
