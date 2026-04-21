import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { id, ...updateData } = body;

  const { error } = await supabase
    .from("coupons")
    .update(updateData)
    .eq("id", id);

  if (error) return Response.json({ success: false, message: error.message });

  return Response.json({ success: true });
}
