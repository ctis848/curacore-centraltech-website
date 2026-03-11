"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getPasswordStrength } from "@/lib/passwordStrength";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignupPage() {
  const supabase = createClientComponentClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          role: "client"   // ⭐ Assign client role here
        },
        emailRedirectTo: `${location.origin}/auth/verify-email`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created! Check your email to verify.");
  }

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 pt-32">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 max-w-md w-full">
        <h1 className="text-4xl font-black text-teal-800 mb-8 text-center">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* PASSWORD STRENGTH METER */}
            <div className="mt-3">
              <div className="h-2 rounded bg-gray-200">
                <div
                  className={`h-full rounded transition-all ${
                    strength.score === 1
                      ? "bg-red-500 w-1/4"
                      : strength.score === 2
                      ? "bg-yellow-500 w-2/4"
                      : strength.score === 3
                      ? "bg-blue-500 w-3/4"
                      : "bg-green-600 w-full"
                  }`}
                />
              </div>
              <p className="text-sm mt-1 text-gray-600">{strength.label}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-teal-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
