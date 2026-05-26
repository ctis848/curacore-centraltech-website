// pages/api/admin/payments/user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userid } = req.query;

  if (!userid) {
    return res.status(400).json({ error: "Missing userid" });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("auth.users")
      .select("id, email, created_at")
      .eq("id", userid)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
