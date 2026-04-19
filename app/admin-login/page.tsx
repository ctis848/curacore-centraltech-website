// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setErrorMsg("Invalid credentials.");
      setLoading(false);
      return;
    }

    // Optional: you can check role via RPC or /User table here

    router.replace("/admin");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow rounded p-6 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-2 text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMsg && <p className="text-red-500 text-sm mb-3">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded hover:bg-black disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
}
