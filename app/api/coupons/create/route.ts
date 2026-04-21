import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("coupons")
    .insert([body]);

  if (error) {
    return Response.json({ success: false, message: error.message });
  }

  return Response.json({ success: true, data });
}
