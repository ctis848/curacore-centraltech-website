import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { id, code, expires, ...rest } = body;

  if (!id) {
    return Response.json({ success: false, message: "Missing coupon ID" });
  }

  // ⭐ Normalize coupon code (always uppercase)
  const updateData: any = {
    ...rest,
    ...(code && { code: code.trim().toUpperCase() }),
    ...(expires && { expires }), // ⭐ Correct field name
  };

  const { error } = await supabase
    .from("coupons")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return Response.json({ success: false, message: error.message });
  }

  return Response.json({ success: true });
}
