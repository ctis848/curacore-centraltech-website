import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { id, code } = await req.json();

  // If fetching by ID (edit page)
  if (id) {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    return Response.json({ data });
  }

  // If validating coupon code (buy page)
  if (code) {
    const clean = code.trim().toUpperCase();

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", clean)
      .single();

    return Response.json({ data });
  }

  return Response.json({ data: null });
}
