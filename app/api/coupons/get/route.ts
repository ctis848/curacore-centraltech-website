import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { id } = await req.json();

  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  return Response.json({ data });
}
