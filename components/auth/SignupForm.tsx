"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    alert(data.success ? "Signup successful!" : data.error);
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4 max-w-md mx-auto">
      <Input name="email" placeholder="Email" type="email" required />
      <Input name="password" placeholder="Password" type="password" required />
      <Button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
