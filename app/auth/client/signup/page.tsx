"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ClientSignup() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (password !== confirm) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/client/verify-email`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setMessage("This email is already registered. Try logging in.");
      } else {
        setMessage(error.message || "Signup failed");
      }
      setLoading(false);
      return;
    }

    setMessage("Account created. Check your email to verify your account.");
    setTimeout(() => router.replace("/auth/client/login"), 2000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PublicNavbar />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <form
          onSubmit={handleSignup}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-6">
            Create Account
          </h1>

          <input
            type="email"
            disabled={loading}
            placeholder="Email"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            disabled={loading}
            placeholder="Password"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            disabled={loading}
            placeholder="Confirm Password"
            className="w-full p-3 rounded border dark:bg-gray-700 dark:text-white mb-4"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {message && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="mt-4 text-sm text-center">
            Already have an account{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/client/login")}
              className="text-teal-600 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
