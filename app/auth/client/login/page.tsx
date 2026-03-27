"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function ClientLogin() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg("Invalid login credentials");
    } else {
      router.replace("/client/panel");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PublicNavbar />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-6">
            Client Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && (
            <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700"
          >
            Login
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <button
              type="button"
              onClick={() => router.push("/auth/client/forgot-password")}
              className="text-teal-600 hover:underline"
            >
              Forgot password
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/client/signup")}
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
