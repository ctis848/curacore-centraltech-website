"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function loginWithProvider(provider: "google" | "github") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-teal-900">Login</h1>

        {error && (
          <div className="p-2 text-sm bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border rounded-md px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="w-full border rounded-md px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 rounded-md font-semibold"
        >
          Login
        </button>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          type="button"
          onClick={() => loginWithProvider("google")}
          className="w-full border py-2 rounded-md font-semibold"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => loginWithProvider("github")}
          className="w-full border py-2 rounded-md font-semibold"
        >
          Continue with GitHub
        </button>

        <p className="text-sm text-center mt-2">
          <a href="/auth/forgot-password" className="text-teal-700 font-semibold">
            Forgot password?
          </a>
        </p>

        <p className="text-sm text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-teal-700 font-semibold">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
