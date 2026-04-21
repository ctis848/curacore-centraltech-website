import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { id, active } = await req.json();

  const { error } = await supabase
    .from("coupons")
    .update({ active })
    .eq("id", id);

  return Response.json({ success: !error });
}
