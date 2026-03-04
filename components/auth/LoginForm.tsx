"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">

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
        {loading ? (
          "Logging in..."
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Login
          </>
        )}
      </Button>
    </form>
  );
}
