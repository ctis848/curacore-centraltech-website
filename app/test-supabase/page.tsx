"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function TestSupabase() {
  const supabase = createSupabaseClient();
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    async function test() {
      try {
        const { data, error } = await supabase.from("machines").select("*").limit(1);

        if (error) {
          setStatus("❌ Supabase reachable but query failed: " + error.message);
        } else {
          setStatus("✅ Supabase connection successful!");
        }
      } catch (err) {
        setStatus("❌ Cannot reach Supabase at all.");
      }
    }

    test();
  }, []);

  return (
    <div className="p-10 text-xl">
      {status}
    </div>
  );
}
