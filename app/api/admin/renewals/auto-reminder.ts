import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const today = new Date();
  const in7days = new Date(today.getTime() + 7 * 86400000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("Companies")
    .select("*")
    .lte("renewal_date", in7days);

  // ✅ FIX: Handle null or error safely
  if (error || !data) {
    return Response.json({
      success: true,
      count: 0,
      message: "No companies found or query failed",
    });
  }

  // Loop safely — data is guaranteed to be non-null here
  for (const c of data) {
    await fetch("/api/admin/renewals/notify-company", {
      method: "POST",
      body: JSON.stringify({ id: c.id }),
    });
  }

  return Response.json({
    success: true,
    count: data.length,
    message: "Auto reminders sent",
  });
}
