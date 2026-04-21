import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { id } = await req.json();

  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ success: false });

  return Response.json({ success: true });
}
