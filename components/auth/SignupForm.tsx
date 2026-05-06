"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignupForm() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {} // NO EMAIL CONFIRMATION
    });

    setLoading(false);

    alert(error ? error.message : "Signup successful!");
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4 max-w-md mx-auto">
      <input name="email" placeholder="Email" type="email" required />
      <input name="password" placeholder="Password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
