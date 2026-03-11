"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function TestLogin() {
  const supabase = createSupabaseClient();

  const [result, setResult] = useState("");

  async function testLogin() {
    setResult("Testing...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: "YOUR_EMAIL_HERE",
      password: "YOUR_PASSWORD_HERE",
    });

    if (error) {
      setResult("❌ Login failed: " + error.message);
      return;
    }

    setResult("✅ Login successful!");
  }

  return (
    <div className="p-10 space-y-4 text-xl">
      <button
        onClick={testLogin}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg"
      >
        Test Login
      </button>

      <div>{result}</div>
    </div>
  );
}
