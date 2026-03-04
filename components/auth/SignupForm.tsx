"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, UserPlus } from "lucide-react";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setErrorMsg(data.error || "Signup failed");
        return;
      }

      alert("Signup successful! Check your email to verify your account.");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6 max-w-md mx-auto">

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* EMAIL */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1 block">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="pl-10"
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1 block">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="pl-10"
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {loading ? "Creating account..." : (
          <>
            <UserPlus className="w-5 h-5" />
            Sign Up
          </>
        )}
      </Button>
    </form>
  );
}
