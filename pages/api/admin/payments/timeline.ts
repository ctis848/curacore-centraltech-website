// pages/api/admin/payments/timeline.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { payment_id } = req.query;

  if (!payment_id) {
    return res.status(400).json({ error: "Missing payment_id" });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("payment_timeline")
      .select("*")
      .eq("payment_id", payment_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
